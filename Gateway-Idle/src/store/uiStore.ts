import { create } from 'zustand'

export type PanelKey = 'battle' | 'armory' | 'achievements' | 'options' | 'training'

export type ModalState =
  | { type: 'none' }
  | {
      type: 'confirm'
      title: string
      message: string
      onConfirm?: () => void
      onCancel?: () => void
    }
  | {
      type: 'danger'
      title: string
      message: string
      onConfirm?: () => void
      onCancel?: () => void
    }

export interface UiState {
  activePanel: PanelKey
  modal: ModalState
  toast: { id: number; message: string; tone?: 'info' | 'success' | 'warning' | 'error' } | null
  importDraft: string
  focusReturnTarget: HTMLElement | null
  setActivePanel: (panel: PanelKey) => void
  openModal: (modal: ModalState) => void
  closeModal: () => void
  setToast: (toast: UiState['toast']) => void
  clearToast: () => void
  setImportDraft: (value: string) => void
  setFocusReturnTarget: (target: HTMLElement | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  activePanel: 'battle',
  modal: { type: 'none' },
  toast: null,
  importDraft: '',
  focusReturnTarget: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: { type: 'none' } }),
  setToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: null }),
  setImportDraft: (value) => set({ importDraft: value }),
  setFocusReturnTarget: (target) => set({ focusReturnTarget: target }),
}))
