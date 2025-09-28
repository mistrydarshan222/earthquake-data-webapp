import { useContext } from 'react';
import { SelectionContext } from '../contexts/SelectionContext';

export function useSelection() {
    const context = useContext(SelectionContext);
    if (context === undefined) {
        throw new Error('useSelection must be used within a SelectionProvider');
    }
    return context;
}