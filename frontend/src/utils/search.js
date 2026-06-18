export const filterByName = (items, busca) =>
  !busca.trim()
    ? items
    : items.filter((item) => item.nome?.toLowerCase().includes(busca.toLowerCase()));
