import { ref } from 'vue';
import { debounce } from '@chefos/utils';

export interface ListStore {
  setSearch: (term: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSort: (sorts: { field: string; order: 'ASC' | 'DESC' }[]) => void;
}

export function useListFilter(store: ListStore) {
  const searchQuery = ref('');

  const handleSearch = debounce((val: string) => {
    store.setSearch(val);
  }, 300);

  const handleReset = () => {
    searchQuery.value = '';
    store.setSearch('');
  };

  const handlePageChange = (page: number) => {
    store.setPage(page);
  };

  const handleSizeChange = (size: number) => {
    store.setLimit(size);
  };

  const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
    if (!order) {
      store.setSort([]);
      return;
    }
    const sortOrder = order === 'ascending' ? 'ASC' : 'DESC';
    // 目前默认单选，但 store 已支持多选
    store.setSort([{ field: prop, order: sortOrder }]);
  };

  return {
    searchQuery,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleSortChange,
  };
}
