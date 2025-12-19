'use client';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Chip } from '@/components/Chip';
import { Category } from '@/data/posts';
import { Search, Box, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, CategoryKey } from '@/lib/categories';

type SortKey = 'recent' | 'rating';
import { paymentMethodOptions, paymentMethodLabelsEs } from '@/lib/validation/post';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SearchFiltersProps {
	selected: Category | 'all';
	onSelectedChange: (category: Category | 'all') => void;
	searchQuery: string;
	onSearchQueryChange: (query: string) => void;
	sortBy: SortKey;
	onSortByChange: (sort: SortKey) => void;
	resultsCount: number;
  payment?: (typeof paymentMethodOptions)[number][];
  onPaymentChange?: (v: (typeof paymentMethodOptions)[number][]) => void;
  location?: string;
  onLocationChange?: (v?: string) => void;
}

export default function SearchFilters({
	selected,
	onSelectedChange,
	searchQuery,
	onSearchQueryChange,
	sortBy,
	onSortByChange,
	resultsCount,
	payment = [],
	onPaymentChange,
	location,
	onLocationChange,
}: SearchFiltersProps) {
  const categoriesList = (Object.keys(CATEGORIES) as CategoryKey[])
    .filter((k): k is Exclude<CategoryKey, 'todos'> => k !== 'todos')
    .map((k) => ({ key: k, def: CATEGORIES[k] }));

  const [searchInput, setSearchInput] = useState<string>(searchQuery);
  const [selectedInput, setSelectedInput] = useState<typeof selected>(selected);
  const [sortInput, setSortInput] = useState<SortKey>(sortBy);
  const [paymentInput, setPaymentInput] = useState<(typeof paymentMethodOptions)[number][]>(payment ?? []);
  const [locationInput, setLocationInput] = useState<string | undefined>(location ?? undefined);

  const arraysEqual = (a: ReadonlyArray<string>, b: ReadonlyArray<string>) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  };

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setSelectedInput(selected);
  }, [selected]);

  useEffect(() => {
    setSortInput(sortBy);
  }, [sortBy]);

  useEffect(() => {
    setPaymentInput(payment ?? []);
  }, [payment]);

  useEffect(() => {
    setLocationInput(location ?? undefined);
  }, [location]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (searchInput !== searchQuery) onSearchQueryChange(searchInput);
    }, 500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (selectedInput !== selected) onSelectedChange(selectedInput);
    }, 500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInput]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (sortInput !== sortBy) onSortByChange(sortInput);
    }, 500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortInput]);

  useEffect(() => {
    const id = setTimeout(() => {
      const pv = payment ?? [];
      if (!arraysEqual(paymentInput, pv)) onPaymentChange?.(paymentInput);
    }, 500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentInput]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (locationInput !== location) onLocationChange?.(locationInput);
    }, 500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationInput]);

  return (
    <div className=' py-6  sm:py-8 flex flex-col gap-6'>
      {/* Search + Filters Button Row */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='relative w-full md:col-span-2'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' size={16} />
          <Input
            value={searchInput}
            className='pl-10 h-12 text-sm w-full'
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Buscar por título, zona o etiquetas…'
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant='outline' className='h-12 gap-2 w-full md:w-auto'>
              <SlidersHorizontal className='w-4 h-4' /> Filtros y Ordenamiento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filtros y Ordenamiento</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              {/* Sort Select inside modal */}
              <div>
                <label className='text-sm text-muted-foreground'>Ordenar por</label>
                <div className='mt-2'>
                  <Select value={sortInput} onValueChange={(v) => setSortInput(v as SortKey)}>
                    <SelectTrigger className='min-h-12'>
                      <ArrowUpDown className='text-muted-foreground' size={16} />
                      <div className='hidden xs:block'>
                        <SelectValue placeholder='Ordenar por' />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='recent'>Más recientes</SelectItem>
                      <SelectItem value='rating'>Mejor valorados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className='text-sm text-muted-foreground'>Ubicación</label>
                <Input value={locationInput ?? ''} onChange={(e) => setLocationInput(e.target.value || undefined)} placeholder='Ciudad, barrio…' />
              </div>

              {/* Payment methods */}
              <div>
                <label className='text-sm text-muted-foreground'>Métodos de pago</label>
                <div className='flex flex-wrap items-center gap-2 mt-2'>
                  {paymentMethodOptions.map((p) => {
                    const sel = (paymentInput ?? []).includes(p)
                    return (
                      <Chip
                        key={p}
                        selected={sel}
                        onClick={() => {
                          const next = sel ? (paymentInput ?? []).filter((x) => x !== p) : [ ...(paymentInput ?? []), p ]
                          setPaymentInput(next)
                        }}
                        className={`cursor-pointer ${sel ? 'bg-slate-800 text-white' : 'border-border'}`}
                      >
                        <span className='font-medium'>{paymentMethodLabelsEs[p]}</span>
                      </Chip>
                    )
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

			{/* Categories Row */}
            <div className='w-full'>
              <div className='overflow-x-auto hide-scrollbar-x'>
                <div className='flex items-center gap-2.5 min-w-max'>
                  <Chip
                      selected={selectedInput === 'all'}
                      onClick={() => setSelectedInput('all')}
                      className={`flex items-center gap-2.5 whitespace-nowrap relative overflow-hidden cursor-pointer ${
                        selectedInput === 'all' ? 'bg-slate-800 text-white' : 'border-border'
                      }`}
                  >
							<div className='relative z-10 flex items-center gap-2.5 p-0.5'>
								<Box size={15} />
								<span className='font-medium'>Todos</span>
							</div>
						</Chip>

						{categoriesList.map(({ key, def }) => {
							const IconComponent = def.icon;
                    const isSelected = selectedInput === key;
                    const activeClass = `bg-gradient-to-r ${def.gradient} text-white border-transparent`;
                    return (
                      <Chip
                        key={key}
                        selected={isSelected}
                        onClick={() => setSelectedInput(key)}
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

      {/* Payment pills removed; managed inside modal */}
    </div>
  );
}
