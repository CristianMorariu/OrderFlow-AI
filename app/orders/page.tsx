const OrdersPage = async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  const users = await response.json();
  console.log(users);
  return (
    <>
      <div>Orders</div>

      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </>
  );
};

export default OrdersPage;
