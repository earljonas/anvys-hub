import { Head } from '@inertiajs/react';

export default function ErrorPage({ status }) {
    const title = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: '403: Forbidden',
    }[status] || 'Error';

    const description = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are forbidden from accessing this page.',
    }[status] || 'Something went wrong.';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <Head title={title} />
            <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center space-y-6">
                <div className="text-6xl font-extrabold text-[#700000]">
                    {status}
                </div>
                <h1 className="text-2xl font-bold text-gray-800">
                    {title.split(': ')[1] || title}
                </h1>
                <p className="text-gray-600">
                    {description}
                </p>
                <div className="pt-4">
                    <a 
                        href="/" 
                        className="inline-block px-6 py-3 bg-[#700000] text-white font-medium rounded-lg hover:bg-[#5a0000] transition-colors focus:ring-4 focus:ring-red-200"
                    >
                        Go Back Home
                    </a>
                </div>
            </div>
        </div>
    );
}
