<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    width="600px"
    @close="closeHandler"
  >
    <el-form ref="dataForm" :model="dataForm" size="small" :rules="dataRule" label-width="80px" style="width: 400px; margin-left:50px;" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="菜单类型" prop="menuType">
        <el-select v-model="dataForm.menuType" placeholder="请选择">
          <el-option v-for="i in dataForm.typeList.length" :label="dataForm.typeList[i-1]" :value="dataForm.types[i-1]"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item  label="菜单名称" prop="menuName">
        <el-input v-model.trim="dataForm.menuName" placeholder="菜单名称" maxlength="32" />
      </el-form-item>
      <el-form-item v-if="dataForm.menuType!=='directory'" label="上级菜单" prop="parentName">
        <el-select v-model="dataForm.superMenuId" placeholder="请选择上级菜单"> <!--dataForm.superMenuId-->
          <el-option v-for="i in menuList.length" :label="menuList[i-1].menuName" :value="menuList[i-1].mid"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="英文名" prop="menuEnglishName">
        <el-input v-model.trim="dataForm.menuEnglishName" placeholder="英文名" maxlength="32" />
      </el-form-item>
      <el-form-item v-if="dataForm.menuType!=='button'" label="重定向url" prop="redirect">
        <el-input v-model.trim="dataForm.redirect" placeholder="点击面包屑重定向的url, 不需要请填写noRedirect" maxlength="32" />
      </el-form-item>
      <el-form-item  label="地址栏url" prop="menuLink">
        <el-tooltip class="item" effect="dark" content="1、单页面路由地址 2、外链地址以http://或https://开头" placement="right">
          <el-input v-model.trim="dataForm.menuLink" placeholder="浏览器地址栏显示的url" />
        </el-tooltip>
      </el-form-item>
      <!--<el-form-item v-if="dataForm.menuType!==2&&dataForm.menuType!==3" label="菜单链接" prop="resourceUrl">
        <el-tooltip class="item" effect="dark" content="1、一级菜单填Layout 2、包含子菜单的二级菜单填nested 3、最后子菜单填写页面对应路径" placement="right">
          <el-input v-model.trim="dataForm.resourceUrl" placeholder="菜单对应前台页面的路径" />
        </el-tooltip>
      </el-form-item>-->

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { treeDataTranslate } from '@/utils/tree'
import { selectMenu, getMenuInfo, menuSaveOrUpdate,getMenusExceptButton } from '@/api/menu'
import Icon from '@/icons'
export default {
  data() {
    var validateUrl = (rule, value, callback) => {
      if (this.dataForm.type === 1 && !/\S/.test(value)) {
        callback(new Error('菜单URL不能为空'))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      dataForm: {
        id: 0,
        menuType: '',
        types: ['directory', 'menu', 'button'],
        typeList: ['目录', '菜单', '按钮'],
        menuName: '',
        superMenuId: 0,
        parentName: '',
        menuLink: '',
        redirect: '',
        menuEnglishName: '',
        authMark: ''
      },
      dataRule: {
        name: [
          { required: true, message: '菜单名称不能为空', trigger: 'blur' }
        ],
        url: [
          { validator: validateUrl, trigger: 'blur' }
        ]
      },
      menuList: [],
      menuListTreeProps: {
        label: 'menuName',
        children: 'children'
      }
    }
  },
  created() {
    this.iconList = Icon.getNameList()
  },
  methods: {
    init(id) {
      this.dataForm.id = id || 0
      getMenusExceptButton().then(data => {
        this.menuList = treeDataTranslate(data.body.list, 'id')
      }).then(() => {
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
        })
      }).then(() => {
        if (!this.dataForm.id) {
          // 新增
          this.menuListTreeSetCurrentNode()
        } else {
          // 修改
          getMenuInfo(this.dataForm.id).then(data => {
            for (var key in data.body) {
              if (this.dataForm.hasOwnProperty(key)) {
                this.dataForm[key] = data.body[key]
              }
            }
            this.menuListTreeSetCurrentNode()
          })
        }
      })
    },
    // 图标选中
    iconActiveHandle(iconName) {
      this.dataForm.resourceIcon = iconName
    },
    // 菜单树选中
    menuListTreeCurrentChangeHandle(data, node) {
      this.dataForm.superMenuId = data.id
      this.dataForm.parentName = data.menuName
    },
    // 菜单树设置当前选中节点
    menuListTreeSetCurrentNode() {
      if (this.$refs.menuListTree) {
        this.$refs.menuListTree.setCurrentKey(this.dataForm.superMenuId)
        this.dataForm.parentName = (this.$refs.menuListTree.getCurrentNode() || {})['menuName']
      }
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          menuSaveOrUpdate(this.dataForm.id, {
            'mid': this.dataForm.id || undefined,
            'menuType': this.dataForm.menuType,
            'redirect': this.dataForm.redirect,
            'menuName': this.dataForm.menuName,
            'superMenuId': this.dataForm.superMenuId,
            'resourceKey': this.dataForm.resourceKey,
            'menuLink': this.dataForm.menuLink,
            'resourceUrl': this.dataForm.resourceUrl,
            'authMark': this.dataForm.authMark
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
    },
    closeHandler() {
      this.$refs['dataForm'].resetFields()
      this.$refs.menuListTree.setCurrentKey(null)
    }
  }
}
</script>

<style lang="scss">
  .mod-menu {
    .menu-list__input,
    .icon-list__input {
      > .el-input__inner {
        cursor: pointer;
      }
    }
    &__icon-popover {
      width: 458px;
      overflow: hidden;
    }
    &__icon-inner {
      width: 478px;
      max-height: 258px;
      overflow-x: hidden;
      overflow-y: auto;
    }
    &__icon-list {
      width: 458px;
      padding: 0;
      margin: -8px 0 0 -8px;
      > .el-button {
        padding: 8px;
        margin: 8px 0 0 8px;
        > span {
          display: inline-block;
          vertical-align: middle;
          width: 18px;
          height: 18px;
          font-size: 18px;
        }
      }
    }
    .icon-list__tips {
      font-size: 18px;
      text-align: center;
      color: #e6a23c;
      cursor: pointer;
    }
  }
</style>
