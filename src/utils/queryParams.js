const handleQueryParams = ({ color, min, max, category, search, profession, material }) => {
  let queryParam = { category }

  if (color && color?.toLocaleLowerCase() !== 'any color') {
    queryParam = { ...queryParam, color }
  }

  if (min && Number(min) > 0) {
    queryParam = { ...queryParam, min }
  }

  if (max && Number(max) > Number(min)) {
    queryParam = { ...queryParam, max }
  }

  if (search && search?.length) {
    queryParam = { ...queryParam, search }
  }

  if (profession && profession?.toLocaleLowerCase() !== 'any profession') {
    queryParam = { ...queryParam, profession }
  }

  if (material && material?.toLocaleLowerCase() !== 'any material') {
    queryParam = { ...queryParam, material }
  }

  return queryParam
}

export default handleQueryParams
