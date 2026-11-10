import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { IAdminCategory } from "@/config/type-schemas";
import { useCategoryActions } from "@/hooks/use-admin-categories";
import { slugify } from "@/lib/utils";
import {
  categoryFormSchema,
  CategoryFormValues,
  emptyCategory,
  toCategoryFormValues,
} from "@/schemas/category-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

const CategoryForm = ({
  category,
  onDone,
}: {
  category?: IAdminCategory;
  onDone: () => void;
}) => {
  const { create, update } = useCategoryActions();
  const { control, handleSubmit, setValue, watch } =
    useForm<CategoryFormValues>({
      resolver: zodResolver(categoryFormSchema),
      defaultValues: category ? toCategoryFormValues(category) : emptyCategory,
    });
  const pending = create.isPending || update.isPending;

  const onSubmit = (values: CategoryFormValues) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      displayOrder: Number(values.displayOrder),
      active: values.active,
    };
    if (category) {
      update.mutate(
        { id: category.id, values: payload },
        { onSuccess: onDone },
      );
    } else {
      create.mutate(payload, { onSuccess: onDone });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => {
            return (
              <Field className="gap-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="cat-name">Name</FieldLabel>
                <Input
                  id="cat-name"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldError
                  errors={[fieldState.error]}
                  className="text-xs italic"
                />
              </Field>
            );
          }}
        />

        <Controller
          control={control}
          name="slug"
          render={({ field, fieldState }) => {
            return (
              <Field className="gap-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="cat-slug">Slug</FieldLabel>
                <Input
                  id="cat-slug"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldError
                  errors={[fieldState.error]}
                  className="text-xs italic"
                />
                {category && (
                  <FieldDescription>
                    Changing the slug breaks old links that use it.
                  </FieldDescription>
                )}
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  className="w-fit"
                  onClick={() => {
                    setValue("slug", slugify(watch("name")), {
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

        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => {
            return (
              <Field className="gap-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="cat-description">
                  Description (optional)
                </FieldLabel>
                <Textarea id="cat-description" rows={3} {...field} />
                <FieldError
                  errors={[fieldState.error]}
                  className="text-xs italic"
                />
              </Field>
            );
          }}
        />

        <Controller
          control={control}
          name="displayOrder"
          render={({ field, fieldState }) => {
            return (
              <Field className="gap-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="car-order">Display order</FieldLabel>
                <Input
                  id="cat-order"
                  type="number"
                  min="0"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <FieldDescription>
                  Lower numbers come first in lists filters.
                </FieldDescription>
                <FieldError
                  errors={[fieldState.error]}
                  className="text-xs italic"
                />
              </Field>
            );
          }}
        />

        <Controller
          control={control}
          name="active"
          render={({ field }) => {
            return (
              <Field
                orientation="horizontal"
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <FieldTitle>Active</FieldTitle>
                  <FieldDescription>
                    Inactive categories are hidden from the store
                  </FieldDescription>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            );
          }}
        />
      </FieldGroup>

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" disabled={pending}>
          {pending && <Spinner />}
          <span>{category ? "Save changes" : "Create category"}</span>
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
