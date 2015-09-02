import * as type from './action-consts.js'

export function setCategoryTitle(id, value) {
  return {
    type: type.CATEGORY_TITLE_SET,
    id: id,
    value: value
  }
}

export function setSectionTitle(id, value) {
  return {
    type: type.SECTION_TITLE_SET,
    id: id,
    value: value
  }
}

export function addOrderingCategory(sectionId, categoryId) {
  return {
    type: type.ORDERING_CATEGORY_ADD,
    sectionId: sectionId,
    categoryId: categoryId
  }
}

export function addOrderingSection(sectionId) {
  return {
    type: type.ORDERING_SECTION_ADD,
    id: sectionId
  }
}

export function setOrdering(tree) {
  return {
    type: type.ORDERING_SET,
    tree: tree
  }
}

export function addCategory(categoryId) {
  return {
    type: type.CATEGORY_ADD,
    id: categoryId
  }
}

export function addSection(sectionId) {
  return {
    type: type.SECTION_ADD,
    id: sectionId
  }
}

export function addCategoryBudget(id, periodId, categoryId, value) {
  return {
    type: type.CATEGORYBUDGET_ADD,
    id: id,
    categoryId: categoryId,
    periodId: periodId,
    amount: parseFloat(value)
  }
}

export function setCategoryBudget(id, value) {
  return {
    type: type.CATEGORYBUDGET_SET,
    id: id,
    amount: parseFloat(value)
  }
}