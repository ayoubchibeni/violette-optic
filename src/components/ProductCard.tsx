type ProductCardProps = {
  name: string;
  price: number;
};

export default function ProductCard(props: ProductCardProps) {
  return (
    <section className="bg-white p-5 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-900">{props.name}</h2>
      <p className="text-gray-600 mt-2">Price: {props.price} TND</p>
    </section>
  );
}