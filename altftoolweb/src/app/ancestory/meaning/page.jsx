import { AncestorHeader } from '../components/AncestorHeader';
import { AncestorMeaningPage } from '../pages/AncestorMeaningPage';
import { fetchNameMeaning } from '../utils/api.jsx';
import { createPageMetadata } from '@/platform/seo/generateMetadata';
import '../style/ancestory.css';

export async function generateMetadata() {
    return createPageMetadata({
        title: 'Name Meaning & Origin | AltFTool Ancestry',
        description:
            'Discover the meaning, origin, and history behind first and last names with the AltFTool ancestry name meaning tool.',
        path: '/ancestory/meaning',
    });
}

function normalizeParam(value) {
    if (!value) return '';
    const param = Array.isArray(value) ? value[0] : value;
    if (param === 'undefined' || param === 'null') return '';
    return String(param).trim();
}

function titleCase(value) {
    return value
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
}

// Built from the query string only. fetchNameMeaning is a network call that can
// throw or come back empty, and AncestorMeaningPage then renders its error or
// missing-input branch instead of the hero — so a heading derived from
// initialData would vanish on exactly the requests that are already degraded.
// The search params are known before any of that happens.
function meaningHeading(type, firstName, lastName) {
    const first = titleCase(firstName).slice(0, 60);
    const last = titleCase(lastName).slice(0, 60);
    if (type === 'full' && first && last) return `Meaning and Origin of the Name ${first} ${last}`;
    if (type === 'last' && last) return `Meaning and Origin of the Surname ${last}`;
    if (first) return `Meaning and Origin of the First Name ${first}`;
    return 'Name Meaning and Origin Finder';
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
        <div className="ancestory-root min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* The visible display title inside AncestorMeaningPage is a <p> on
                the hero image, and it only renders on the success branch. This
                is the document's only h1; sr-only because the hero already
                carries the title visually and promoting that <p> would both
                move pixels and tie the h1 to the fetch. */}
            <h1 className="sr-only">{meaningHeading(type, firstName, lastName)}</h1>
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
