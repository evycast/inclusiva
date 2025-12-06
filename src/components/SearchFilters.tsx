'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Chip } from '@/components/Chip';
import { Category } from '@/data/posts';
import {
	FaSearch,
	FaBoxOpen,
	FaSortAmountDown,
} from 'react-icons/fa';
import { CATEGORIES, CategoryKey } from '@/lib/categories';

type SortKey = 'recent' | 'rating' | 'priceAsc' | 'priceDesc';

interface SearchFiltersProps {
	selected: Category | 'all';
	onSelectedChange: (category: Category | 'all') => void;
	searchQuery: string;
	onSearchQueryChange: (query: string) => void;
	sortBy: SortKey;
	onSortByChange: (sort: SortKey) => void;
	resultsCount: number;
}

export default function SearchFilters({
	selected,
	onSelectedChange,
	searchQuery,
	onSearchQueryChange,
	sortBy,
	onSortByChange,
	resultsCount,
}: SearchFiltersProps) {
	const categoriesList = (Object.keys(CATEGORIES) as CategoryKey[])
		.filter((k): k is Exclude<CategoryKey, 'todos'> => k !== 'todos')
		.map((k) => ({ key: k, def: CATEGORIES[k] }));

	return (
		<div className=' py-6  sm:py-8 flex flex-col gap-6'>
			{/* Search and Sort Row */}
			<div className='flex flex-1 gap-4'>
				<div className='relative w-full'>
					<FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' size={16} />
					<Input
						value={searchQuery}
						className='pl-10 h-12 text-sm'
						onChange={(e) => onSearchQueryChange(e.target.value)}
						placeholder='Buscar por título, zona o etiquetas…'
					/>
				</div>

				{/* Sort Select */}
				<Select value={sortBy} onValueChange={(v) => onSortByChange(v as SortKey)}>
					<SelectTrigger className='min-h-12'>
						<FaSortAmountDown className='text-muted-foreground' size={16} />
						<div className='hidden xs:block'>
							<SelectValue placeholder='Ordenar por' />
						</div>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='recent'>Más recientes</SelectItem>
						<SelectItem value='rating'>Mejor valorados</SelectItem>
						<SelectItem value='priceAsc'>Menor precio</SelectItem>
						<SelectItem value='priceDesc'>Mayor precio</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Categories Row */}
			<div className='w-full'>
				<div className='overflow-x-auto hide-scrollbar-x'>
					<div className='flex items-center gap-2.5 min-w-max'>
						<Chip
							selected={selected === 'all'}
							onClick={() => onSelectedChange('all')}
							className={`flex items-center gap-2.5 whitespace-nowrap relative overflow-hidden cursor-pointer ${
								selected === 'all' ? 'bg-slate-800 text-white' : 'border-border'
							}`}
						>
							<div className='relative z-10 flex items-center gap-2.5 p-0.5'>
								<FaBoxOpen size={15} />
								<span className='font-medium'>Todos</span>
							</div>
						</Chip>

						{categoriesList.map(({ key, def }) => {
                            const IconComponent = def.icon;
                            const isSelected = selected === key;
                            const activeClass = `bg-gradient-to-r ${def.gradient} text-white border-transparent`;
                            return (
                                <Chip
                                    key={key}
                                    selected={isSelected}
                                    onClick={() => onSelectedChange(key)}
                                    className={`flex items-center gap-2.5 whitespace-nowrap relative overflow-hidden cursor-pointer ${
                                        isSelected ? activeClass : `${def.bgColor} ${def.textColor} ${def.borderColor}`
                                    }`}
                                >
									<div className='relative z-10 flex items-center gap-2.5 p-0.5'>
										<IconComponent size={15} />
										<span className='font-medium'>{def.label}</span>
									</div>
								</Chip>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
