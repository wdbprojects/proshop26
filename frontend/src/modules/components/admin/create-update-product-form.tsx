"use client";

import { useCallback, useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { useAdminProduct } from "@/hooks/use-admin-product";
import { zodResolver } from "@hookform/resolvers/zod";
import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ImageKitAuthenticatorType,
  productCreateSchema,
  ProductType,
} from "@/config/type-schemas";
import z from "zod";

/* IMAGEKIT */
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";

/* SHADCN UI */
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { HardDriveUpload, Star, UploadCloudIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; //5MB

/* FORM-ONLY SCHEMA, separate from the wire-level productCreateSchema. Two reasons: 1. price is entered in dollars for a sane admin UX, but the API wants priceCents, so this schema validates the dollar value and the conversion happens at submit time; 2. `images` is managed as its own React state (sync upload status per file), not as a react-hook-form field, so it's deliverately excluded here and merged in only when building the request body. */
const productFormSchema = productCreateSchema
  .omit({
    priceCents: true,
    images: true,
  })
  .extend({
    priceDollars: z.coerce
      .number({ message: "Enter a price" })
      .positive({ message: "Price must be greater than 0" }),
  });
type ProductFormValues = z.input<typeof productFormSchema>;

/* Client-side working shape for one image - a superset of what the API accepts, with extra fields (clientId, status) that exist only to drive the upload UI and are stripped out before the request body is built. */
type FormImage = {
  clientId: string;
  id?: string; // present only for an already-saved product_images row
  url: string;
  imageKitFileId: string;
  alt?: string;
  status: "uploading" | "done" | "error";
  errorMessage?: string;
};

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const makeClientId = () => {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const CreateUpdateProductForm = ({ product }: { product?: ProductType }) => {
  const { categories, createMutation, updateMutation, deleteUploadMutation } =
    useAdminProduct();
  const router = useRouter();
  const isEdit = Boolean(product?.id);

  const [images, setImages] = useState<FormImage[]>(() => {
    return (
      product?.images.map((img) => {
        return {
          clientId: img.id,
          id: img.id,
          url: img.url,
          /* Existing rows can theoretically have a null imageKitFileId (the column is nullable). The update contract requires a non-empty string on every image, so a legacy row missing it can't be resubmitted as-is - surfacing that here as a visible error is better than silently dropping the image or sending invalid date. */
          imageKitFileId: img.imageKitFileId ?? "",
          alt: img.alt ?? undefined,
          status: img.imageKitFileId ? "done" : "error",
          errorMessage: img.imageKitFileId
            ? undefined
            : "Missing ImageKit reference - remove and re-upload this image.",
        };
      }) ?? []
    );
  });

  /* Tracks changes to `images` specifically - isDirty (below) only covers registers react-hook-form fields, so an images-only edit (add, remove, reorder) would never flip isDirty and canSubmit would stay false even though something real changed. */
  const [imagesDirty, setImagesDirty] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: "onChange",
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          categoryId: product.category.id,
          brand: product.brand ?? "",
          description: product.description,
          longDescription: product.longDescription,
          stock: product.stock,
          isFeatured: product.isFeatured,
          priceDollars: product.priceCents / 100,
          currency: product.currency,
          active: product.active,
        }
      : {
          name: "",
          slug: "",
          categoryId: "",
          brand: "",
          description: "",
          longDescription: "",
          stock: 0,
          isFeatured: false,
          priceDollars: undefined,
          currency: "usd",
          active: true,
        },
  });

  const {
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { isValid, isDirty },
  } = form;

  useEffect(() => {
    if (!product) return;
    reset({
      name: product.name,
      slug: product.slug,
      categoryId: product.category.id,
      brand: product.brand ?? "",
      description: product.description,
      longDescription: product.longDescription,
      stock: product.stock,
      isFeatured: product.isFeatured,
      priceDollars: product.priceCents / 100,
      currency: product.currency,
      active: product.active,
    });
    setImages(
      product.images.map((img) => {
        return {
          clientId: img.id,
          id: img.id,
          url: img.url,
          imageKitFileId: img.imageKitFileId ?? "",
          alt: img.alt ?? undefined,
          status: img.imageKitFileId ? "done" : "error",
          errorMessage: img.imageKitFileId
            ? undefined
            : "Missing ImageKit reference = remove  and re-upload this image.",
        };
      }),
    );
    setImagesDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  /* authenticator */
  const authenticator = async () => {
    try {
      const data = await apiFetch<ImageKitAuthenticatorType>(
        "/api/admin/imagekit/auth",
        {
          method: "GET",
        },
      );
      const { signature, expire, token, publicKey } = data;
      return {
        signature: signature,
        expire: expire,
        token: token,
        publicKey: publicKey,
      };
    } catch (err) {
      console.error("Authenticator error: ", err);
      throw new Error("Authenticator request failed");
    }
  };

  const uploadOne = async (file: File) => {
    const clientId = makeClientId();
    setImages((prev) => [
      ...prev,
      { clientId, url: "", imageKitFileId: "", status: "uploading" },
    ]);
    try {
      const { signature, expire, token, publicKey } = await authenticator();
      const result = await upload({
        file: file,
        fileName: file.name,
        signature: signature,
        expire: expire,
        token: token,
        publicKey: publicKey,
      });
      setImages((prev) => {
        return prev.map((img) => {
          return img.clientId === clientId
            ? {
                ...img,
                url: result?.url ?? "",
                imageKitFileId: result?.fileId ?? "",
                status: "done",
              }
            : img;
        });
      });
      setImagesDirty(true);
    } catch (err) {
      const message =
        err instanceof ImageKitAbortError
          ? "Upload cancelled"
          : err instanceof ImageKitInvalidRequestError
            ? err.message
            : err instanceof ImageKitUploadNetworkError
              ? "Network error during upload"
              : err instanceof ImageKitServerError
                ? "ImageKit server error"
                : "Upload failed";
      console.error("Upload error", err);
      setImages((prev) => {
        return prev.map((img) => {
          return img.clientId === clientId
            ? { ...img, status: "error", errorMessage: message }
            : img;
        });
      });
      toast.error(message);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      rejections.forEach((rejection) => {
        toast.error(`${rejection.file.name}: ${rejection.errors[0]?.message}`);
      });

      const availableSlots = MAX_IMAGES - images.length;
      if (availableSlots <= 0) {
        toast.warning(`You can only have up to ${MAX_IMAGES} images`);
        return;
      }
      const filesToUpload = acceptedFiles.slice(0, availableSlots);
      if (acceptedFiles.length > availableSlots) {
        toast.warning(`Only ${availableSlots} more image(s) can be added`);
      }
      filesToUpload.forEach((file) => {
        return void uploadOne(file);
      });
    },
    [images.length],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDrop,
    accept: { "image/*": [] },
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: true,
    disabled: images.length >= MAX_IMAGES,
  });

  const removeImage = (clientId: string) => {
    const target = images.find((img) => {
      return img.clientId === clientId;
    });
    setImages((prev) => {
      return prev.filter((img) => {
        return img.clientId !== clientId;
      });
    });
    /* Only clean up ImageKit for uploads that were never saved to a product (no `id`) - an already-saved image is removed from the DB by simply leaving it out of the images array on submit, and the backend handles its own ImageKit cleanup after that commit. */
    if (!target?.id && target?.imageKitFileId) {
      deleteUploadMutation.mutate({ imageKitFileId: target.imageKitFileId });
    }
    setImagesDirty(true);
  };

  const makePrimary = (clientId: string) => {
    setImages((prev) => {
      const target = prev.find((img) => {
        return img.clientId === clientId;
      });
      if (!target) return prev;
      return [
        target,
        ...prev.filter((img) => {
          return img.clientId !== clientId;
        }),
      ];
    });
  };

  const hasPendingUploads = images.some((img) => {
    return img.status === "uploading";
  });
  const hasImageErrors = images.some((img) => {
    return img.status === "error";
  });
  const readyImages = images.filter((img) => {
    return img.status === "done";
  });

  const onSubmitForm = async (data: ProductFormValues) => {
    if (readyImages.length === 0) {
      toast.error("At least one image is required");
      return;
    }
    if (hasPendingUploads) {
      toast.error("Please wait for uploads to finish");
      return;
    }
    const { priceDollars, ...rest } = data;

    const body = {
      ...rest,
      priceCents: Math.round((priceDollars as number) * 100),
      images: readyImages.map(({ id, url, imageKitFileId, alt }) => {
        return {
          ...(id ? { id } : {}),
          url: url,
          imageKitFileId: imageKitFileId,
          ...(alt ? { alt } : {}),
        };
      }),
    };

    try {
      if (isEdit && product) {
        await updateMutation.mutateAsync({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: body as any,
          id: product.id,
        });
        toast.success("Product updated successfully");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await createMutation.mutateAsync({ body: body as any });
        toast.success("Products created successfully");
      }
      router.push(routes.admin);
    } catch (err) {
      /* Surface the backend's actual message (slug conflict, invalid category, etc.) instead of a generic string - errorHandlerMiddleware always returns {error: "..."}, and apiFetch throws that as err.message */
      const message =
        err instanceof Error ? err.message : "Failed to save products";
      toast.error(message);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;
  const canSubmit =
    isValid &&
    (isDirty || imagesDirty) &&
    !hasPendingUploads &&
    readyImages.length > 0;

  return (
    <Card className="rounded-md sm:max-w-lg">
      <div>
        <form id="create-update-product" onSubmit={handleSubmit(onSubmitForm)}>
          <CardContent className="px-6">
            {/* NAME, SLUG, CATEGORY, DESCRIPTION */}
            <FieldGroup className="gap-1 space-y-2">
              {/* NAME */}
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel
                        htmlFor="name-product-admin"
                        className="text-foreground"
                      >
                        Product Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="name-product-admin"
                        aria-invalid={fieldState.invalid}
                        placeholder="Product Name"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              {/* SLUG */}
              <Controller
                name="slug"
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel
                        htmlFor="slug-product-admin"
                        className="text-foreground"
                      >
                        Slug
                      </FieldLabel>

                      <Input
                        {...field}
                        id="slug-product-admin"
                        aria-invalid={fieldState.invalid}
                        placeholder="product-slug"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        className="text-foreground mx-auto mt-1 max-w-44 border text-xs underline"
                        onClick={() => {
                          setValue("slug", slugify(watch("name") || ""), {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      >
                        Generate from name
                      </Button>
                    </Field>
                  );
                }}
              />

              {/* CATEGORY */}
              <Controller
                name="categoryId"
                control={control}
                render={({ field, fieldState }) => {
                  const selectedCategory = categories?.find((cat) => {
                    return cat.id === field.value;
                  });
                  return (
                    <Field
                      // orientation="vertical"
                      data-invalid={fieldState.invalid}
                      className="gap-1"
                    >
                      <FieldContent>
                        <FieldLabel
                          htmlFor="select-category"
                          className="text-foreground"
                        >
                          Choose a category
                        </FieldLabel>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </FieldContent>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="select-category"
                          aria-invalid={fieldState.invalid}
                          className="min-w-30"
                        >
                          <SelectValue placeholder="Select a category">
                            {selectedCategory?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat) => {
                            return (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </Field>
                  );
                }}
              />

              {/* BRAND */}
              <Controller
                name="brand"
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel
                        htmlFor="brand-product-admin"
                        className="text-foreground"
                      >
                        Brand
                      </FieldLabel>
                      <Input
                        {...field}
                        id="brand-product-admin"
                        aria-invalid={fieldState.invalid}
                        placeholder="Brand"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              {/* DESCRIPTION */}
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel
                        htmlFor="description-product-admin"
                        className="text-foreground"
                      >
                        Product Description
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id="description-product-admin"
                        placeholder="Shown in listings and search results"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              {/* LONG DESCRIPTION */}
              <Controller
                name="longDescription"
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldLabel
                        htmlFor="long-description-product-admin"
                        className="text-foreground"
                      >
                        Full Description
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id="long-description-product-admin"
                        placeholder="Shown on the product detail page"
                        autoComplete="off"
                        rows={5}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              {/* PRICE & CURRENCY */}
              <FieldGroup className="mt-0 flex flex-row gap-0 space-y-4">
                <Field className="flex-2">
                  <Controller
                    name="priceDollars"
                    control={control}
                    render={({ field, fieldState }) => {
                      return (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="gap-1"
                        >
                          <FieldLabel
                            htmlFor="price-product-admin"
                            className="text-foreground"
                          >
                            Price (USD)
                          </FieldLabel>
                          <Input
                            // {...field}
                            type="number"
                            id="price-product-admin"
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                            placeholder="19.99"
                            step="0.01"
                            min="0.01"
                            value={
                              field.value == null ? "" : String(field.value)
                            }
                            onChange={(event) => {
                              const raw = event.target.value;
                              field.onChange(
                                raw === "" ? undefined : Number(raw),
                              );
                            }}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      );
                    }}
                  />
                </Field>
                <Field className="flex-1">
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field, fieldState }) => {
                      return (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="gap-1"
                        >
                          <FieldLabel htmlFor="currency-product-admin">
                            Currency
                          </FieldLabel>
                          <Input
                            {...field}
                            type="text"
                            id="currency-product-admin"
                            disabled={true}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                          />
                        </Field>
                      );
                    }}
                  />
                </Field>
                <Field className="flex-1">
                  <Controller
                    name="stock"
                    control={control}
                    render={({ field, fieldState }) => {
                      return (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="gap-1"
                        >
                          <FieldLabel
                            htmlFor="stock-product-admin"
                            className="text-foreground"
                          >
                            Stock
                          </FieldLabel>
                          <Input
                            type="number"
                            id="stock-product-admin"
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                            min="0"
                            value={
                              field.value == null ? "" : String(field.value)
                            }
                            onChange={(event) => {
                              const raw = event.target.value;
                              field.onChange(
                                raw === "" ? undefined : Number(raw),
                              );
                            }}
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      );
                    }}
                  />
                </Field>
              </FieldGroup>
            </FieldGroup>

            {/* IMAGES */}
            <FieldGroup className="gap-2">
              <FieldLabel>
                Images ({images.length}/{MAX_IMAGES}) - first image is primary
              </FieldLabel>
              <div
                {...getRootProps()}
                className={cn(
                  "flex min-h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-center transition-colors",
                  isDragActive && "border-primary bg-primary/5",
                  images.length >= MAX_IMAGES &&
                    "cursor-not-allowed opacity-50",
                )}
              >
                <input {...getInputProps()} />
                <UploadCloudIcon className="text-muted-foreground size-6" />
                <p className="text-muted-foreground text-sm">
                  {isDragActive
                    ? "Drop images here"
                    : "Drag and drop images here, or click to browse"}
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {images.map((img, index) => {
                    return (
                      <div
                        key={img.clientId}
                        className="relative aspect-square overflow-hidden rounded-md border"
                      >
                        {img.status === "uploading" ? (
                          <div className="bg-muted flex h-full w-full items-center justify-center">
                            <Spinner />
                          </div>
                        ) : img.status === "error" ? (
                          <div className="bg-destructive/10 flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center">
                            <span className="text-destructive text-xs">
                              {img.errorMessage ?? "Upload failed"}
                            </span>
                          </div>
                        ) : (
                          <Image
                            src={img.url}
                            alt={img.alt ?? ""}
                            fill
                            className="object-cover"
                          />
                        )}

                        {index === 0 && img.status === "done" && (
                          <span className="bg-primary text-primary-foreground absolute top-1 left-1 rounded px-1.5 py-0.5 text-[10px]">
                            Primary
                          </span>
                        )}
                        <Button
                          size="xs"
                          variant="ghost"
                          className="bg-muted absolute right-1 px-1"
                          type="button"
                          onClick={() => {
                            removeImage(img.clientId);
                          }}
                        >
                          <X className="size-3.5" />
                        </Button>
                        {index !== 0 && img.status === "done" && (
                          <Button
                            size="xs"
                            variant="ghost"
                            type="button"
                            onClick={() => makePrimary(img.clientId)}
                            className="bg-background/80 absolute bottom-1 left-1 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]"
                          >
                            <Star className="size-3" />
                            <span>Make primary</span>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {hasImageErrors && (
                <p className="text-destructive text-xs">
                  Remove or retry failed uploads before saving
                </p>
              )}

              {/* ACTIVE /FEATURED */}
              <FieldGroup className="mt-2 gap-2">
                <Controller
                  name="active"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldContent>
                          <FieldLabel htmlFor="active-product-admin">
                            <Field
                              orientation="horizontal"
                              className="flex items-center justify-between"
                            >
                              <div className="flex flex-col">
                                <FieldTitle>Product Active</FieldTitle>
                                <FieldDescription>
                                  Active products are shown in the store
                                </FieldDescription>
                              </div>
                              <Switch
                                id="active-product-admin"
                                className="cursor-pointer"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          </FieldLabel>
                        </FieldContent>
                      </Field>
                    );
                  }}
                />
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-1"
                      >
                        <FieldContent>
                          <FieldLabel htmlFor="featured-product-admin">
                            <Field
                              orientation="horizontal"
                              className="flex items-center justify-between"
                            >
                              <div className="flex flex-col">
                                <FieldTitle>Featured</FieldTitle>
                                <FieldDescription>
                                  Shown in the home page&apos;s featured section
                                </FieldDescription>
                              </div>
                              <Switch
                                id="featured-product-admin"
                                className="cursor-pointer"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Field>
                          </FieldLabel>
                        </FieldContent>
                      </Field>
                    );
                  }}
                />
              </FieldGroup>
            </FieldGroup>
          </CardContent>

          {/* ACTION BUTTONS */}
          <CardFooter className="mt-6 flex w-full items-center justify-between gap-4 rounded-b-md px-6 py-4">
            <Link
              href={routes.admin}
              className={cn(
                buttonVariants({ variant: "secondary", size: "default" }),
                "flex-1",
              )}
            >
              Cancel
            </Link>
            <Button
              size="default"
              type="submit"
              form="create-update-product"
              className="flex flex-1 items-center justify-center gap-2"
              disabled={!canSubmit || isMutating}
            >
              {isMutating ? (
                <Spinner />
              ) : (
                <HardDriveUpload className="size-4" />
              )}
              <span>
                {isMutating
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                    ? "Update Product"
                    : "Create Product"}
              </span>
            </Button>
          </CardFooter>
        </form>
      </div>
    </Card>
  );
};

export default CreateUpdateProductForm;
