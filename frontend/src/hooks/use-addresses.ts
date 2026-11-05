import { toast } from "@/components/ui/toast";
import { AddressesResponse } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";
import { AddressFormValues } from "@/schemas/address-schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { string } from "better-auth";

export const ADDRESSES_QUERY_KEY = ["addresses"];

export const useAddresses = () => {
  return useQuery<AddressesResponse>({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: () => {
      return apiFetch<AddressesResponse>("/api/addresses", { method: "GET" });
    },
  });
};

export const useAddressActions = () => {
  const queryClient = useQueryClient();
  const refresh = () => {
    return queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
  };
  const onError = (err: Error) => {
    toast.add({
      type: "error",
      title: "Error",
      description: err.message || "Something went wrong",
    });
  };

  const create = useMutation({
    mutationFn: (values: AddressFormValues) => {
      return apiFetch("/api/addresses", { method: "POST", body: values });
    },
    onSuccess: () => {
      refresh();
      toast.add({ type: "success", title: "Address saved" });
    },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: AddressFormValues }) => {
      return apiFetch(`/api/addresses/${id}`, { method: "PUT", body: values });
    },
    onSuccess: () => {
      refresh();
      toast.add({ type: "success", title: "Address updated" });
    },
    onError,
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => {
      return apiFetch(`/api/addresses/${id}/default`, { method: "PATCH" });
    },
    onSuccess: () => {
      refresh();
      toast.add({ type: "success", title: "Default address updated" });
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => {
      return apiFetch(`/api/addresses/${id}/default`, { method: "DELETE" });
    },
    onSuccess: () => {
      refresh();
      toast.add({ type: "success", title: "Address deleted" });
    },
    onError,
  });

  return { create, update, setDefault, remove };
};
