import OrderDetailsPage from "@/modules/presentation/orders/order-details-page";

const OrderDetailsPageMain = async ({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) => {
  const { orderId } = await params;

  return <OrderDetailsPage orderId={orderId} />;
};

export default OrderDetailsPageMain;
