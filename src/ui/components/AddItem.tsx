import {useRef} from 'react';

const AddItem = ({newItem, setNewItem, handleSubmit}) => {
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  return <form className="m-3" onSubmit={handleSubmit}>
    <label htmlFor="add-item">Add Item</label>
    <input autoFocus
           ref={inputRef}
           type="text" id="add-item"
           placeholder="Insert item text" required
           value={newItem}
           onChange={(e) => setNewItem(e.target.value)}/>
    <button type="submit"
            onClick={() => inputRef.current.focus()}
            aria-label="Add item">Add
    </button>
  </form>
};

export default AddItem;
