// 1. T와 .000Z를 제거하는 함수
export const formatIsoToClean = (isoString: string) => {
  if (!isoString) return ''
  return isoString.replace('T', ' ').split('.')[0]
}
