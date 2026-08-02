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
            <AncestorHeader />
            {/*
                /ancestory/meaning served no <h1> — AncestorMeaningPage starts
                its heading tree at <h3>, so the document had no top-level
                heading and the outline skipped two levels. sr-only because the
                result view already displays the name being looked up, and a
                second visible title above it would just repeat it.
            */}
            <h1 className="sr-only">Name meaning, origin and history</h1>
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
