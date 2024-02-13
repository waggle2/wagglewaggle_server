import { Item } from '../entities/item.entity';

interface ItemWithOwnership extends Item {
  isOwned: boolean;
}
export default ItemWithOwnership;
