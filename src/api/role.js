import request from '@/utils/request'

export function getRoles() {
  return request({
    url: '/role/rlist',
    method: 'get'
  })
}

export function getPageRoles(data) {
  return request({
    url: '/role/rlist',
    method: 'get',
    data: data
  })
}

export function deleteRole(ids) {
  return request({
    url: '/role/delete',
    method: 'delete',
    data: ids
  })
}

export function getRoleInfo(rid) {
  return request({
    url: `/role/info/${rid}`,
    method: 'get'
  })
}

export function addOrUpdate(rid, data) {
  return request({
    url: `/role/${!rid ? 'save' : 'update'}`,
    method: 'post',
    data: data
  })
}
