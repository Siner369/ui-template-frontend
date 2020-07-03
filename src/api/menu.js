import request from '@/utils/request'

export function nav() {
  return request({
    url: '/menu/nav',
    method: 'get'
  })
}

export function getMenus() {
  return request({
    url: '/menu/select',
    method: 'get'
  })
}

export function getMenusExceptButton() {
  return request({
    url: '/menu/selectAll',
    method: 'get'
  })
}

export function deleteMenu(mid) {
  return request({
    url: `/menu/delete/${mid}`,
    method: 'delete'
  })
}

export function selectMenu() {
  return request({
    url: '/menu/select',
    method: 'get'
  })
}

export function getMenuInfo(menuId) {
  return request({
    url: `/menu/info/${menuId}`,
    method: 'get'
  })
}

export function menuSaveOrUpdate(mid, data) {
  return request({
    url: `/menu/${!mid ? 'save' : 'update'}`,
    method: 'post',
    data: data
  })
}
