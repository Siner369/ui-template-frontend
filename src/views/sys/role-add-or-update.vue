<template>
  <el-dialog
    :title="!dataForm.rid ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="dataForm.roleName" placeholder="角色名称" />
      </el-form-item>
      <el-form-item label="备注" prop="roleNote">
        <el-input v-model="dataForm.roleNote" placeholder="备注" />
      </el-form-item>
      <el-form-item size="mini" label="授权">
        <el-tree
          ref="menuListTree"
          :data="menuList"
          :props="menuListTreeProps"
          node-key="id"
          :default-expand-all="true"
          show-checkbox
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { treeDataTranslate } from '@/utils/tree'
import { getMenus } from '@/api/menu'
import { getRoleInfo, addOrUpdate } from '@/api/role'
export default {
  data() {
    return {
      visible: false,
      menuList: [],
      menuListTreeProps: {
        label: 'resourceName',
        children: 'children'
      },
      dataForm: {
        rid: 0,
        roleName: '',
        roleNote: ''
      },
      dataRule: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ]
      },
      tempKey: 6666666 // 临时key, 用于解决tree半选中状态项不能传给后台接口问题. # 待优化
    }
  },
  methods: {
    init(id) {
      this.dataForm.rid = id || 0
      getMenus().then(data => {
        this.menuList = treeDataTranslate(data.body, 'id')
      }).then(() => {
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
          this.$refs.menuListTree.setCheckedKeys([])
        })
      }).then(() => {
        if (this.dataForm.rid) {
          getRoleInfo(this.dataForm.rid).then(data => {
            this.dataForm.roleName = data.body.roleName
            this.dataForm.roleNote = data.body.roleNote
            var idx = data.body.menuIds.indexOf(this.tempKey)
            if (idx !== -1) {
              data.body.menuIds.splice(idx, data.body.menuIds.length - idx)
            }
            this.$refs.menuListTree.setCheckedKeys(data.body.menuIds)
          })
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addOrUpdate(this.dataForm.rid, {
            'rid': this.dataForm.rid || undefined,
            'roleName': this.dataForm.roleName,
            'roleNote': this.dataForm.roleNote,
            'menuIdList': [].concat(this.$refs.menuListTree.getCheckedKeys(), [this.tempKey], this.$refs.menuListTree.getHalfCheckedKeys())
          }).then(data => {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.$emit('refreshDataList')
              }
            })
          })
        }
      })
    }
  }
}
</script>
