"use client";

import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productCreateSchema, ProductFormData } from "@/config/type-schemas";
import z from "zod";

/* SHADCN UI */
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ProductFormValues = z.input<typeof productCreateSchema>;

const CreateUpdateProductForm = ({
  product,
}: {
  product?: ProductFormData;
}) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: product ?? {
      name: "",
      slug: "",
      categoryId: "",
      brand: "",
      description: "",
      longDescription: "",
      stock: 0,
      isFeatured: false,
      priceCents: 0,
      active: true,
      currency: "usd",
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid, isSubmitting, isDirty },
  } = form;

  const onSubmitForm: SubmitHandler<ProductFormValues> = (data) => {
    console.log(data);
  };

  /* LOGS */

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
            </FieldGroup>
          </CardContent>
          {/* ACTION BUTTONS */}
          <CardFooter className="mt-6 flex w-full items-center justify-between gap-4 rounded-b-md px-6 py-4">
            <Button variant="outline" size="sm" className="flex-1">
              Reset
            </Button>
            <Button variant="default" size="sm" className="flex-1">
              Create Product
            </Button>
          </CardFooter>
        </form>
      </div>
    </Card>
  );
};

export default CreateUpdateProductForm;
