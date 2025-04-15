import toast from 'react-hot-toast';

export function error_handler_for_ui(t: any, type: string, detail: string ) {
    if (detail=== 'TypeError: fetch failed') {
        console.error(t('Cannot access to backend.'))
        toast.error(t('Cannot access to backend.'))
    } else {
        console.error(t('An error occurred on the backend. Please contact the administrator.') + `: ${detail}`)
        toast.error(t('An error occurred on the backend. Please contact the administrator.') + `: ${detail}`);
    }
}