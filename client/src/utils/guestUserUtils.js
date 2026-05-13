// utils/guestUserUtils.js

// --- Address ---
export const getGuestAddress = () => {
  return JSON.parse(localStorage.getItem("guest_address") || "[]");
};
export const addGuestAddress = (address) => {
  let addresses = getGuestAddress();
  addresses.push(address);
  localStorage.setItem("guest_address", JSON.stringify(addresses));
  return addresses;
};
export const setGuestAddress = (addresses) => {
  localStorage.setItem("guest_address", JSON.stringify(addresses));
  return addresses;
};

// --- Orders ---
export const getGuestOrders = () => {
  return JSON.parse(localStorage.getItem("guest_orders") || "[]");
};
export const addGuestOrder = (order) => {
  let orders = getGuestOrders();
  orders.push(order);
  localStorage.setItem("guest_orders", JSON.stringify(orders));
  return orders;
};
export const setGuestOrders = (orders) => {
  localStorage.setItem("guest_orders", JSON.stringify(orders));
  return orders;
};