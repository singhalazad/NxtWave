import { createStore, combineReducers, applyMiddleware } from "redux";
//creates a store which holds the state tree of the app

import thunk from "redux-thunk";
//allows to return functions from store

import { composeWithDevTools } from "redux-devtools-extension";
//used for debugging

import {
  productReducers,
  productDetailsReducer,
} from "./reducers/productReducers";

const reducer = combineReducers({
  productReducers,
  productDetailsReducer,
});

let initialState = {}; //it will contain all the data we want to preload in the website
const middleware = [thunk];
const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
