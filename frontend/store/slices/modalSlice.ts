import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModalType, ModalData, ModalState } from '@/lib/types';

const initialState: ModalState = {
  isOpen: false,
  type: null,
  data: null,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<{ type: ModalType; data?: ModalData }>) => {
      state.isOpen = true;
      state.type = action.payload.type;
      state.data = action.payload.data || null;
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.type = null;
      state.data = null;
    },
    updateModalData: (state, action: PayloadAction<ModalData>) => {
      state.data = { ...state.data, ...action.payload };
    },
  },
});

export const { openModal, closeModal, updateModalData } = modalSlice.actions;

export default modalSlice.reducer;