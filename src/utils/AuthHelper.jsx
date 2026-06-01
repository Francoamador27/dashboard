  export const getAuthHeaders = () => {
    const token = localStorage.getItem("AUTH_TOKEN");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };