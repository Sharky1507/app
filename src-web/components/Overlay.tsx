import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Portal } from './Portal';

interface Props {
  children: ReactNode;
  portalName: string;
  open: boolean;
  onClose?: () => void;
  zIndex?: keyof typeof zIndexes;
}

const zIndexes: Record<number, string> = {
  10: 'z-10',
  20: 'z-20',
  30: 'z-30',
  40: 'z-40',
  50: 'z-50',
};

export function Overlay({ zIndex = 30, open, onClose, portalName, children }: Props) {
  return (
    <Portal name={portalName}>
      {open && (
        <FocusTrap>
          <motion.div
            className={classNames('fixed inset-0', zIndexes[zIndex])}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              aria-hidden
              onClick={onClose}
              className="absolute inset-0 bg-gray-600/30 dark:bg-black/30 backdrop-blur-sm"
            />
            {/* Add region to still be able to drag the window */}
            <div data-tauri-drag-region className="absolute top-0 left-0 right-0 h-md" />
            {children}
          </motion.div>
        </FocusTrap>
      )} 
    </Portal>
  );
}
