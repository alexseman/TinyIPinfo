import LineItem from './LineItem';

const ItemList = ({items, toggleItemCheck}) => {
  return <ul>
    {items.map((item) => {
      return <LineItem key={item.id} item={item} toggleItemCheck={toggleItemCheck}/>
    })}
  </ul>
};

export default ItemList;
