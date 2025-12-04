import { ref } from 'vue';
import { debounce } from '@chefos/utils';

export interface ListStore {
  setSearch: (term: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSort: (field: string, order: 'ASC' | 'DESC') => void;
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
      store.setSort('', 'ASC');
      return;
    }
    const sortOrder = order === 'ascending' ? 'ASC' : 'DESC';
    store.setSort(prop, sortOrder);
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
