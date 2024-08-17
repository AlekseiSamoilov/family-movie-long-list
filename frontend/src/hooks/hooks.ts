import { RootState } from "@reduxjs/toolkit/query";
import { useDispatch, useSelector } from "react-redux";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypeUseSelectorHook<RootState> = useSelector;