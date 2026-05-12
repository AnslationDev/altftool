import { AncestorHeader } from '../components/AncestorHeader';
import { AncestorMeaningPage } from '../pages/AncestorMeaningPage';
import { fetchNameMeaning } from '../utils/api.jsx';
import '../style/ancestory.css';

function normalizeParam(value) {
    if (!value) return '';
    const param = Array.isArray(value) ? value[0] : value;
    if (param === 'undefined' || param === 'null') return '';
    return String(param).trim();
}

export default async function AncestoryMeaningRoute({ searchParams }) {
    const params = await searchParams;
    const firstName = normalizeParam(params?.first);
    const lastName = normalizeParam(params?.last);
    const rawType = normalizeParam(params?.type);

    let type = ['first', 'last', 'full'].includes(rawType) ? rawType : '';
    if (!type) {
        if (firstName && lastName) type = 'full';
        else if (lastName) type = 'last';
        else type = 'first';
    }

    const isMissingInput =
        (type === 'first' && !firstName) ||
        (type === 'last' && !lastName) ||
        (type === 'full' && (!firstName || !lastName));

    let initialData = null;
    let error = null;

    if (!isMissingInput) {
        try {
            initialData = await fetchNameMeaning({
                type,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
            });
        } catch (err) {
            error = err?.message || 'Unable to load name data';
        }
    }

    return (
        <div className="ancestory-root min-h-screen bg-gray-50 dark:bg-(--background)">
            <AncestorHeader />
            <AncestorMeaningPage
                type={type}
                firstNameParam={firstName}
                lastNameParam={lastName}
                initialData={initialData}
                error={error}
                isMissingInput={isMissingInput}
            />
        </div>
    );
}
