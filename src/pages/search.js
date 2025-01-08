import React, { useState, useEffect, useCallback, useRef } from 'react'
import cn from 'classnames'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useStateContext } from '../utils/context/StateContext'
import useDebounce from '../utils/hooks/useDebounce'
import useFetchData from '../utils/hooks/useFetchData'
import { getAllDataByType, getDataByCategory } from '../lib/cosmic'
import { ClipLoader } from 'react-spinners';

import Layout from '../components/Layout'
import Icon from '../components/Icon'
import Card from '../components/Card'
import Dropdown from '../components/Dropdown'
import priceRange from '../utils/constants/priceRange'
import handleQueryParams from '../utils/queryParams'
import { PROFESSION_OPTIONS, OPTIONS, CARD_MATERIAL_OPTIONS } from '../utils/constants/appConstants'

import styles from '../styles/pages/Search.module.sass'
import { PageMeta } from '../components/Meta'

const Search = ({ categoriesGroup, navigationItems, categoryData }) => {
  const { query, push } = useRouter()
  const { categories } = useStateContext()

  const { data: searchResult, fetchData } = useFetchData(
    categoryData?.length ? categoryData : []
  )

  const [searchResultValue, setSearchResultValue] = useState([]); 

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    if (searchResult && searchResult.length > 0) {
      setSearchResultValue(searchResult);
    } else if (searchResult && searchResult.length === 0) {
      setSearchResultValue([]);
    }

    return () => clearTimeout(timer);
  }, [searchResult]);

  const categoriesTypeData = categoriesGroup['type'] || categories['type']

  const [search, setSearch] = useState(query['search'] || '')
  const debouncedSearchTerm = useDebounce(search, 600)

  const [{ min, max }, setRangeValues] = useState(
    query['min'] || query['max']
      ? { min: query['min'] || 1, max: query['max'] || 100000 }
      : priceRange
  )
  const debouncedMinTerm = useDebounce(min, 600)
  const debouncedMaxTerm = useDebounce(max, 600)

  const [activeIndex, setActiveIndex] = useState(
    query['category'] || ''
  )
  const [option, setOption] = useState(query['color'] || OPTIONS[0])

  const [professionOption, setProfessionOption] = useState(query['profession'] || PROFESSION_OPTIONS[0])

  const [cardMaterialOption, setCardMaterialOption] = useState(query['cardMaterial'] || CARD_MATERIAL_OPTIONS[0])


  const handleChange = ({ target: { name, value } }) => {
    setRangeValues(prevFields => ({
      ...prevFields,
      [name]: value,
    }))
  }

  const handleFilterDataByParams = useCallback(
    async ({
      category = activeIndex,
      color = option,
      min = debouncedMinTerm,
      max = debouncedMaxTerm,
      search = debouncedSearchTerm,
      profession = professionOption,
      cardMaterial = cardMaterialOption,
    }) => {
      const params = handleQueryParams({
        category,
        color,
        min: min.trim(),
        max: max.trim(),
        search: search.toLowerCase().trim(),
        profession,
        cardMaterial,
      })

      push(
        {
          pathname: '/search',
          query: params,
        },
        undefined,
        { shallow: true }
      )

      const filterParam = Object.keys(params).reduce(
        (acc, key) => acc + `&${key}=` + `${params[key]}`,
        ''
      )

      const result = await fetchData(`/api/filter?${filterParam}`)

      if(result?.status === 404){
        setSearchResultValue([])
        toast.dismiss();

        toast.error('Oops! This combination is currently not available', {
          position: 'center-middle',
        });


      }else if(result?.status === 200){
        toast.dismiss();
      }

    },
    [
      activeIndex,
      debouncedSearchTerm,
      debouncedMinTerm,
      debouncedMaxTerm,
      fetchData,
      option,
      push,
      professionOption,
      cardMaterialOption,
    ]
  )

  const getDataByFilterOptions = useCallback(
    async color => {
      setOption(color)
      handleFilterDataByParams({ color })
    },
    [handleFilterDataByParams]
  )

  const getDataByFilterProfessionOptions = useCallback(
    async profession => {
      setProfessionOption(profession)
      handleFilterDataByParams({ profession })
    },
    [handleFilterDataByParams]
  )

  const getDataByFilterCardMaterialOptions = useCallback(
    async cardMaterial => {
      setCardMaterialOption(cardMaterial)
      handleFilterDataByParams({ cardMaterial })
    },
    [handleFilterDataByParams]
  )

  const handleCategoryChange = useCallback(
    async category => {
      setActiveIndex(category)
      handleFilterDataByParams({ category })
    },
    [handleFilterDataByParams]
  )

  const handleSubmit = e => {
    e.preventDefault()
    handleFilterDataByParams({ search: debouncedSearchTerm })
  }

  const resetFilter = () =>{

    setSearch('')
    setRangeValues({ min: '', max: '' })
    setActiveIndex('')
    setOption(OPTIONS[0])
    setProfessionOption(PROFESSION_OPTIONS[0])
    setCardMaterialOption(CARD_MATERIAL_OPTIONS[0])

    handleFilterDataByParams({
      category: '',
      color: OPTIONS[0],
      min: debouncedMinTerm,
      max: debouncedMaxTerm,
      search: '',
      profession: PROFESSION_OPTIONS[0],
      cardMaterial: CARD_MATERIAL_OPTIONS[0],
    })

  }

  useEffect(() => {
    let isMount = true

    if (
      isMount &&
      (debouncedSearchTerm?.length ||
        debouncedMinTerm?.length ||
        debouncedMaxTerm?.length)
    ) {
      handleFilterDataByParams({
        min: debouncedMinTerm,
        max: debouncedMaxTerm,
        search: debouncedSearchTerm,
      })
    } else {
      !categoryData?.length &&
        handleFilterDataByParams({ category: activeIndex })
    }

    return () => {
      isMount = false
    }

  }, [debouncedSearchTerm, debouncedMinTerm, debouncedMaxTerm])

  return (
    <Layout navigationPaths={navigationItems[0]?.metadata}>
      <PageMeta
        title={'Discover | Zeltap Marketplace'}
        description={
          'Zeltap Marketplace'
        }
      />
      <div className={cn('section-pt80', styles.section)}>
        <div className={cn('container', styles.container)}>
          <div className={styles.row}>
            <div className={styles.filters}>
              <div className={styles.top}>
                <div className={styles.title}>Search</div>
              </div>
              <div className={styles.form}>
                <div className={styles.label}>Search Cards</div>
                <form
                  className={styles.search}
                  action=""
                  onSubmit={handleSubmit}
                >
                  <input
                    className={styles.input}
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    name="search"
                    placeholder="Search..."
                    required
                  />
                  <button className={styles.result}>
                    <Icon name="search" size="16" />
                  </button>
                </form>
              </div>
              <div className={styles.sorting}>
                <div className={styles.dropdown}>
                  <div className={styles.label}>Card Material</div>
                  <Dropdown
                    className={styles.dropdown}
                    value={cardMaterialOption}
                    setValue={getDataByFilterCardMaterialOptions}
                    options={CARD_MATERIAL_OPTIONS}
                  />
                </div>
              </div>
              <div className={styles.sorting}>
                <div className={styles.dropdown}>
                  <div className={styles.label}>Select Profession</div>
                  <Dropdown
                    className={styles.dropdown}
                    value={professionOption}
                    setValue={getDataByFilterProfessionOptions}
                    options={PROFESSION_OPTIONS}
                  />
                </div>
              </div>
              <div className={styles.sorting}>
                <div className={styles.dropdown}>
                  <div className={styles.label}>Select color</div>
                  <Dropdown
                    className={styles.dropdown}
                    value={option}
                    setValue={getDataByFilterOptions}
                    options={OPTIONS}
                  />
                </div>
              </div>
              {/* <div className={styles.range}>
                <div className={styles.label}>Price range</div>
                <div className={styles.prices}>
                  <input
                    className={styles.input}
                    type="text"
                    value={min}
                    onChange={handleChange}
                    name="min"
                    placeholder="MIN"
                    required
                  />
                  <p className={styles.separator}>to</p>
                  <input
                    className={styles.input}
                    type="text"
                    value={max}
                    onChange={handleChange}
                    name="max"
                    placeholder="MAX"
                    required
                  />
                </div>
              </div> */}
              <div className={styles.sorting}>
                <div className={styles.dropdown}>
                  <button 
                  className={cn('button-small', styles.button)}
                  onClick={resetFilter}>
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.wrapper}>
              <div className={styles.nav}>
                <button
                  className={cn(styles.link, {
                    [styles.active]: '' === activeIndex,
                  })}
                  onClick={() => handleCategoryChange('')}
                >
                  All
                </button>
                {categoriesTypeData &&
                  Object.entries(categoriesTypeData)?.map((item, index) => (
                    <button
                      className={cn(styles.link, {
                        [styles.active]: item[0] === activeIndex,
                      })}
                      onClick={() => handleCategoryChange(item[0])}
                      key={index}
                    >
                      {item[1]}
                    </button>
                  ))}
              </div>
              <div>
                {loading ? (
                  <div className={styles.loader}>
                    <ClipLoader size={50} color="#36D7B7" loading={loading} />
                  </div>
                  ) : (
                    <div className={styles.list}>
                      {searchResultValue?.length ? (
                        searchResultValue?.map((x, index) => (
                          <Card className={styles.card} item={x} key={index} />
                        ))
                      ) : (
                        <p className={styles.inform}>Try another category!</p>
                      )}
                    </div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Search

export async function getServerSideProps({ query }) {
  const navigationItems = (await getAllDataByType('navigation')) || []

  const categoryTypes = (await getAllDataByType('categories')) || []
  const categoriesData = await Promise.all(
    categoryTypes?.map(category => {
      return getDataByCategory(category?.id)
    })
  )

  const categoryData = query?.hasOwnProperty('category')
    ? await getDataByCategory(query['category'])
    : []

  const categoriesGroups = categoryTypes?.map(({ id }, index) => {
    return { [id]: categoriesData[index] }
  })

  const categoriesType = categoryTypes?.reduce((arr, { title, id }) => {
    return { ...arr, [id]: title }
  }, {})

  const categoriesGroup = { groups: categoriesGroups, type: categoriesType }

  return {
    props: { navigationItems, categoriesGroup, categoryData },
  }
}
