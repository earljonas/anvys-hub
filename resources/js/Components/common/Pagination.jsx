import React from 'react';
import { Link } from '@inertiajs/react';

const Pagination = ({ links }) => {
    // If only one page (or less), don't show pagination
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-wrap gap-1 justify-center mt-6">
            {links.map((link, index) => {
                const isFirst = index === 0;
                const isLast = index === links.length - 1;

                return (
                    <Link
                        key={index}
                        href={link.url || '#'}
                        className={`
                            px-4 py-2 text-sm rounded-lg border transition-all duration-200
                            ${link.active
                                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] font-medium'
                                : 'bg-white text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                            }
                            ${!link.url ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
                        `}
                        disabled={!link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        preserveScroll
                        preserveState
                    />
                );
            })}
        </div>
    );
};

export default Pagination;
