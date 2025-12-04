import { ApiClient } from '@chefos/api-client';
import { API_URL } from '@chefos/utils';

// Assuming API is running on localhost:4000/api
export const api = new ApiClient(`${API_URL}/api`);
