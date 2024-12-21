import type { Patch } from 'immer'

/** 检查路径是否应该被包含 */
export function isPathIncluded(
  patch: Patch,
  excludePaths: string[][] = [],
  includePaths?: string[][],
): boolean {
  // 判断路径是否是父路径匹配
  const isParentMatch = (
    basePath: string[],
    testPath: Patch['path'],
  ): boolean => {
    return (
      basePath.length <= testPath.length
      && basePath.every((segment, index) => basePath[index] === testPath[index])
    )
  }

  // 检查是否被排除
  const isExcluded = excludePaths.some(
    excludedPath =>
      excludedPath.every(
        (segment, index) => excludedPath[index] === patch.path[index],
      ) || isParentMatch(excludedPath, patch.path),
  )
  if (isExcluded) {
    return false
  }

  // 如果存在 includePaths，检查路径是否被包含
  if (includePaths) {
    return includePaths.some(
      includedPath =>
        includedPath.every(
          (segment, index) => includedPath[index] === patch.path[index],
        ) || isParentMatch(includedPath, patch.path),
    )
  }

  // 如果没有 include 配置，默认包含所有未排除的路径
  return true
}

export function filterPatches(
  patches: Patch[][],
  exclude?: string[][],
  include?: string[][],
) {
  if (!exclude) {
    return patches
  }
  const [patchesItem, inversePatchesItem] = patches
  const filteredPatches = patchesItem.filter(patch =>
    isPathIncluded(patch, exclude, include),
  )
  const filteredInversePatches = inversePatchesItem.filter(inversePatch =>
    isPathIncluded(inversePatch, exclude, include),
  )
  return [filteredPatches, filteredInversePatches]
}
