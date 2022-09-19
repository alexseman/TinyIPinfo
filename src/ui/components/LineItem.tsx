const LineItem = ({item, toggleItemCheck}) => {
  return <li>
    <input onChange={() => toggleItemCheck(item.id)} type="checkbox" checked={item.checked}/>&nbsp;
    <span>{item.item}</span>
  </li>
};

export default LineItem;
