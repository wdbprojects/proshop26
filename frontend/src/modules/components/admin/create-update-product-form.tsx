"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAdminProduct } from "@/hooks/use-admin-product";
import { zodResolver } from "@hookform/resolvers/zod";
import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";

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
import {
  HardDriveUpload,
  Octagon,
  OctagonX,
  UploadCloudIcon,
} from "lucide-react";
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
import { ICreateProduct } from "@/config/types";
import {
  productCreateSchema,
  ProductCreateType,
  ProductPatchType,
} from "@/config/schemas";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CreateUpdateProductForm = ({
  product,
}: {
  product?: ProductCreateType;
}) => {
  const {
    categories,
    createMutation,
    updateMutation,
    deleteImageMutation,
    deleteUploadMutation,
  } = useAdminProduct();

  /* IMAGEKIT SETUP */
  /* track current upload progress */
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [hasFileSelected, setHasFileSelected] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [filenameToUpload, setFilenameToUpload] = useState<string | null>("");
  const [imageUrl, setImageUrl] = useState<string | null>("");
  const [imageKitFileId, setImageKitFileId] = useState<string | null>("");

  /* file input element ref */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* create abort controller */
  const abortController = new AbortController();

  /* authenticator */
  const authenticator = async () => {
    try {
      const data = await apiFetch("/api/admin/imageKit/auth", {
        method: "GET",
      });
      const { signature, expire, token, publicKey } = data;
      return { signature, expire, token, publicKey };
    } catch (err) {
      console.error("Authenticator error: ", err);
      throw new Error("Authenticator request failed");
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  /* function that handles file upload process */
  const handleUpload = async () => {
    // access the file input element using the ref
    const fileInput = fileInputRef.current;

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      toast.warning("Please select a file to upload");
      return;
    }
    // reset states
    setProgress(0);
    setIsUploading(true);
    setUploadComplete(false);

    // extract the first file from the file input
    const file = fileInput.files[0];
    // retrieve authentication parameters for the upload
    let authParams;
    try {
      authParams = await authenticator();
    } catch (authError) {
      console.error("Failed to authenticate for upload:", authError);
      setIsUploading(false);
      return;
    }
    const { signature, expire, token, publicKey } = authParams;
    // call the ImageKit SDk upload function with the required parameters and callbacks
    try {
      const uploadResponse = await upload({
        // authentication parameters
        expire: expire,
        token: token,
        signature: signature,
        publicKey: publicKey,
        file: file,
        fileName: file.name,
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
        abortSignal: abortController.signal,
      });

      setImageKitFileId(uploadResponse?.fileId ?? null);
      setImageUrl(uploadResponse?.url ?? null);
      setPreview(uploadResponse?.url ?? null);
      setFilenameToUpload(uploadResponse?.name ?? null);
      setUploadComplete(true);
      setProgress(100);
      toast.success("File uploaded successfully");
      if (fileInput) {
        fileInput.value = "";
        setHasFileSelected(false);
      }
    } catch (err) {
      // handle specific error types provided by the ImageKit SDK.
      if (err instanceof ImageKitAbortError) {
        console.error("Upload aborted:", err.reason);
      } else if (err instanceof ImageKitInvalidRequestError) {
        console.error("Invalid request:", err.message);
      } else if (err instanceof ImageKitUploadNetworkError) {
        console.error("Network error:", err.message);
      } else if (err instanceof ImageKitServerError) {
        console.error("Server error:", err.message);
      } else {
        // handle any other errors that may occur.
        console.error("Upload error:", err);
      }
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = () => {
    if (product && product?.id) {
      deleteImageMutation.mutate({ productId: product?.id as string });
    } else if (!product && imageKitFileId) {
      deleteUploadMutation.mutate({ imageKitFileId });
    }
    setIsUploading(false);
    setUploadComplete(false);
    setPreview(null);
    setFilenameToUpload(null);
  };

  const isUploadButtonDisabled =
    !hasFileSelected || isUploading || uploadComplete;

  const resetUploadState = () => {
    setProgress(0);
    setIsUploading(false);
    setUploadComplete(false);
    setHasFileSelected(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const router = useRouter();

  const form = useForm<ProductCreateType>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      id: "",
      name: "",
      slug: "",
      category: "General",
      description: "",
      priceCents: undefined,
      currency: "usd",
      imageFile: undefined,
      active: false,
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid, isSubmitting, isDirty },
  } = form;

  // populate form when product prop changes
  useEffect(() => {
    if (product) {
      const defaultValues: ProductCreateType = {
        name: product?.name || "",
        slug: product?.slug || "",
        category: product?.category || "General",
        description: product?.description || "",
        priceCents: product?.priceCents ? product?.priceCents / 100 : 0,
        currency: product?.currency || "usd",
        active: product?.active || false,
        id: "",
      };
      reset(defaultValues);
      setPreview(product.imageUrl || null);
      setImageUrl(product.imageUrl || null);
      setImageKitFileId(product.imageKitFileId || null);
      setFilenameToUpload(product.name || null);
    }
  }, [product, reset]);

  /* ON SUBMIT FORM */
  const onSubmitForm = async (data: ProductCreateType) => {
    try {
      const body: ICreateProduct = {
        slug: data.slug,
        name: data.name.trim(),
        category: data.category || "General",
        description: data.description.trim(),
        priceCents: data.priceCents ? Math.round(data.priceCents * 100) : 0,
        currency: data.currency || "usd",
        imageUrl: imageUrl ?? undefined,
        imageKitFileId: imageKitFileId ?? undefined,
        active: data.active || false,
      };

      let result;

      if (product && product.id) {
        const patch: ProductPatchType = {};
        if (body.name !== product.name) patch.name = body.name;
        if (body.category !== (product.category ?? "General"))
          patch.category = body.category;
        if (body.description !== product.description)
          patch.description = body.description;
        if (body.priceCents !== Number(product.priceCents))
          patch.priceCents = body.priceCents;
        if (body.currency !== product.currency) patch.currency = body.currency;
        if ((body.imageUrl ?? "") !== (product.imageUrl ?? "")) {
          patch.imageUrl = body.imageUrl;
        }
        if (
          (body.imageKitFileId ?? null) !== (product.imageKitFileId ?? null)
        ) {
          patch.imageKitFileId = body.imageKitFileId;
        }
        if (body.active !== product.active) patch.active = body.active;

        if (Object.keys(patch).length === 0) {
          toast.info("No changes to save");
        }
        result = await updateMutation.mutateAsync({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: patch as any,
          id: product?.id,
        });
        toast.success("Product updated successfully");
      } else {
        result = await createMutation.mutateAsync({ body: body });
        toast.success("Product created successfully");
      }
      // reset form with fresh data
      reset({ ...data, id: result?.id || data.id });
      router.push(routes.admin);
    } catch (err) {
      console.error(err instanceof Error ? err.message : "An error ocurred");
      toast.error("Failed to save product. Please try again.");
    }
  };

  /* HANDLE RESET */
  const handleReset = () => {
    if (product) {
      reset(product);
    } else {
      reset({
        id: "",
        name: "",
        slug: "",
        category: "General",
        description: "",
        priceCents: undefined,
        currency: "usd",
        active: false,
      });
    }
    resetUploadState();
    setPreview(null);
    setFilenameToUpload(null);
    setImageUrl(null);
  };

  // helper to determine button text and state
  const getButtonState = () => {
    const isEdit = !!product?.id;
    const actionText = isEdit ? "Updat" : "Creat";
    if (isSubmitting) {
      return { text: `${actionText}ing...`, disabled: true, icon: <Spinner /> };
    }
    return {
      text: `${actionText}e Product`,
      disabled: !isValid || !isDirty,
      icon: <HardDriveUpload className="size-4" />,
    };
  };
  const buttonState = getButtonState();

  /* LOGS */

  console.log({ product });

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
                      <FieldLabel htmlFor="name-product-admin">
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
                      <FieldLabel htmlFor="slug-product-admin">Slug</FieldLabel>
                      <Input
                        {...field}
                        id="slug-product-admin"
                        aria-invalid={fieldState.invalid}
                        placeholder="Product Slug"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              {/* CATEGORY */}
              <Controller
                name="category"
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <Field
                      orientation="vertical"
                      data-invalid={fieldState.invalid}
                      className="gap-1"
                    >
                      <FieldContent>
                        <FieldLabel
                          htmlFor="select-category"
                          data-invalid={fieldState.invalid}
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
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat: string) => {
                            return (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
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
                    <Field>
                      <FieldLabel>Product Description</FieldLabel>
                      <Textarea
                        {...field}
                        placeholder="Enter your product description"
                        autoComplete="off"
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
                    name="priceCents"
                    control={control}
                    render={({ field, fieldState }) => {
                      return (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="gap-1"
                        >
                          <FieldLabel htmlFor="priceCents-product-admin">
                            Price (USD)
                          </FieldLabel>
                          <Input
                            {...field}
                            type="number"
                            id="priceCents-product-admin"
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
                            placeholder="1 cent or more (0.01)"
                            className="flex-2"
                            value={field.value ?? ""}
                            onChange={(event) => {
                              const value = event.target.value;
                              if (value === "") {
                                field.onChange(undefined);
                              } else {
                                const numValue = parseFloat(value);
                                field.onChange(
                                  isNaN(numValue) ? undefined : numValue,
                                );
                              }
                            }}
                            // step="0.01"
                            // min="0.01"
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

            {/* IMAGE UPLOAD & ACTIVE */}
            <FieldGroup className="relative mt-2">
              {/* UPLOAD INPUT */}
              <Controller
                name="imageFile"
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid} className="">
                      <div className="flex items-center justify-between gap-2">
                        <FieldLabel
                          htmlFor="image-product-admin"
                          className="flex-1"
                        >
                          Image
                        </FieldLabel>
                      </div>
                      <div className="relative min-h-30 w-full space-y-4 rounded-md border border-dashed px-4 pt-4 pb-3 ring-0 transition-colors duration-200 ease-in-out">
                        {preview && (
                          <Button
                            className="absolute top-1 right-1 z-1000 cursor-pointer"
                            size="icon"
                            variant="destructive"
                            onClick={handleImageDelete}
                          >
                            <OctagonX className="size-4" />
                          </Button>
                        )}

                        <div
                          className={cn(
                            "relative flex h-full flex-col items-center justify-center p-0",
                          )}
                        >
                          <Input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(event) => {
                              const files = event.target.files;
                              setHasFileSelected(!!files && files.length > 0);
                              setFilenameToUpload(
                                (!!files && files[0].name) || null,
                              );
                            }}
                          />

                          {!preview ? (
                            <div className="flex h-full flex-col items-center justify-center gap-4 space-y-0">
                              {!hasFileSelected && (
                                <>
                                  <p className="text-muted-foreground text-sm">
                                    Drag and drop some files here, or click
                                    select files
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className={cn("text-xs")}
                                    type="button"
                                    onClick={handleBrowseFiles}
                                    disabled={hasFileSelected}
                                  >
                                    Select Files
                                  </Button>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2 space-y-0">
                              <div className="relative h-24 w-24 max-w-32">
                                <Image
                                  src={preview}
                                  fill
                                  alt="Preview"
                                  className="object-cover"
                                />
                              </div>
                              <p className="text-xs">{filenameToUpload}</p>
                            </div>
                          )}
                          {hasFileSelected && (
                            <div className="flex flex-col items-center justify-center gap-4">
                              <p>
                                <strong>File Name:</strong> {filenameToUpload}
                              </p>
                              <Button
                                type="button"
                                onClick={handleUpload}
                                size="sm"
                                variant={
                                  isUploadButtonDisabled
                                    ? "secondary"
                                    : "destructive"
                                }
                                disabled={isUploadButtonDisabled}
                              >
                                {isUploading ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <Spinner />
                                    <span>Uploading</span>
                                  </div>
                                ) : uploadComplete ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <span>✅ Uploaded</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2">
                                    <UploadCloudIcon />
                                    <span>Upload File</span>
                                  </div>
                                )}
                              </Button>

                              <div className="flex items-center justify-start gap-2">
                                <span>Upload progress: </span>
                                <progress value={progress} max={100} />
                                <span>{progress} %</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Field>
                  );
                }}
              />
              {/* ACTIVE */}
              <Controller
                name="active"
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid} className="gap-1">
                      <FieldContent>
                        <FieldLabel htmlFor="active-product-admin">
                          <Field
                            orientation="horizontal"
                            data-invalid={fieldState.invalid}
                            className="flex items-center justify-between"
                          >
                            <div className="flex flex-col">
                              <FieldTitle>Product Active</FieldTitle>
                              <FieldDescription>
                                Active products are shown in the store
                              </FieldDescription>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </div>
                            <Switch
                              id="active-product-admin"
                              className="cursor-pointer"
                              name={field.name}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-invalid={fieldState.invalid}
                            />
                          </Field>
                        </FieldLabel>
                      </FieldContent>
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </CardContent>

          {/* ACTION BUTTONS */}
          <CardFooter className="mt-6 flex w-full items-center justify-between gap-4 rounded-b-md px-6 py-4">
            {!product ? (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset
              </Button>
            ) : (
              <Link
                href={routes.admin}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "flex-1",
                )}
              >
                Cancel
              </Link>
            )}

            <Button
              size="sm"
              type="submit"
              form="create-update-product"
              className="flex flex-1 items-center justify-center gap-2"
              disabled={buttonState.disabled}
            >
              {buttonState.icon}
              <span>{buttonState.text}</span>
            </Button>
          </CardFooter>
        </form>
      </div>
    </Card>
  );
};

export default CreateUpdateProductForm;
