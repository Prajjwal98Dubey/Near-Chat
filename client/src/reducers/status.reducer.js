// file for all reducers (don't judge by file name "status.reducer.js")
export const statusReducer = (state, action) => {
  switch (action.type) {
    case "APPEAR_ONLINE":
      return { ...state, ["isOnline"]: true };
    case "IS_FIND_USER":
      return {
        ...state,
        ["isFindUser"]: true,
        ["isLoading"]: true,
        ["hideBtn"]: true,
      };
    default:
      break;
  }
};

export const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER_ID":
      return { ...state, ["userId"]: action.value };
    case "SET_USER_COORDS":
      return { ...state, ["lat"]: action.value.lat, ["lon"]: action.value.lon };
    case "SET_USER_ROOM":
      return { ...state, ["roomId"]: action.value };
    default:
      break;
  }
};
