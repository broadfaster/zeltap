const mergeUserBioData = (firebaseBioData, bioDataTemplate) => {
  return Object.fromEntries(
    Object.entries(bioDataTemplate).map(([key, defaultValue]) => [
      key,
      firebaseBioData[key] !== undefined && firebaseBioData[key] !== ''
        ? firebaseBioData[key]
        : defaultValue,
    ])
  )
}

export default mergeUserBioData
