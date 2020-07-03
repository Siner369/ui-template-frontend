<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px" @keyup.enter.native="dataFormSubmit()">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="dataForm.userName" placeholder="登录帐号" />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="dataForm.name" placeholder="姓名" />
      </el-form-item>
      <el-form-item label="密码" prop="password" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.password" type="password" placeholder="请输入8-16位密码" />
      </el-form-item>
      <el-form-item label="确认密码" prop="comfirmPassword" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.comfirmPassword" type="password" placeholder="确认密码" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="dataForm.email" placeholder="邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="dataForm.mobile" placeholder="手机号" />
      </el-form-item>
      <el-form-item label="角色" size="mini" prop="ridList">
        <el-checkbox-group v-model="dataForm.ridList">
          <el-checkbox v-for="role in roleList" :key="role.rid" :label="role.rid">{{ role.roleName }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="状态" size="mini" prop="state">
        <el-radio-group v-model="dataForm.state">
          <el-radio :label="0">禁用</el-radio>
          <el-radio :label="1">正常</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { isEmail, isMobile } from '@/utils/validate'
import { getRoles } from '@/api/role'
import { getInfoById, addOrUpdate } from '@/api/user'
export default {
  data() {
    var validatePassword = (rule, value, callback) => {
      if (this.notNullJudge(value)) {
        if (this.lengthNotAvalidenabled(value)) {
          callback(new Error('请输入8-16位的密码'))
        } else if (this.regexSprit1(value)) {
          callback(new Error('密码种类应该超过三种'))
        } else if (this.notThreeEuqChar(value)) {
          callback(new Error('密码不能同时存在三个相同字符'))
        } else if (!this.noNumCharThree(value)) {
          callback(new Error('密码中不能存在三个连续数字 ，字母，特殊字符'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    var validateComfirmPassword = (rule, value, callback) => {
      if (!this.dataForm.id && !/\S/.test(value)) {
        callback(new Error('确认密码不能为空'))
      } else if (this.dataForm.password !== value) {
        callback(new Error('确认密码与密码输入不一致'))
      } else {
        callback()
      }
    }
    var validateEmail = (rule, value, callback) => {
      if (!isEmail(value)) {
        callback(new Error('邮箱格式错误'))
      } else {
        callback()
      }
    }
    var validateMobile = (rule, value, callback) => {
      if (!isMobile(value)) {
        callback(new Error('手机号格式错误'))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      roleList: [],
      dataForm: {
        uid: 0,
        userName: '',
        password: '',
        comfirmPassword: '',
        name: '',
        email: '',
        mobile: '',
        ridList: [],
        state: 1
      },
      dataRule: {
        userName: [
          { required: true, message: '用户名不能为空', trigger: 'blur' }
        ],
        password: [
          { validator: validatePassword, trigger: 'blur' }
        ],
        comfirmPassword: [
          { validator: validateComfirmPassword, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    lengthNotAvalidenabled(newPassword) {
      if (this.notNullJudge(newPassword)) {
        if (newPassword.length < 8 || newPassword.length > 16) {
          return true
        } else {
          return false
        }
      }
    },
    notNullJudge(newPassword) {
      if (this.dataForm.uid && !/\S/.test(newPassword)) {
        return false
      } else {
        return true
      }
    },
    noNumCharThree(newPassword) {
      var inputString = '1234567890abcdefghijklmopqrstuvwxyz!@#$%^&*()'
      for (var i = 0; i < newPassword.length - 3; i++) {
        var sprintString = newPassword.substring(i, i + 3)

        if (inputString.indexOf(sprintString.toLowerCase()) >= 0) {
          return false
        }
      }
      return true
    },
    notThreeEuqChar(newPassword) {
      var input = /(\w).{0,}\1.{0,}\1/
      if (!input.test(newPassword)) {
        return false
      } else {
        return true
      }
    },
    regexSprit1(newPassword) {
      // eslint-disable-next-line
        var reg = "(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[=\\\\~!@#$%^&*()\-+|\\[{\\]}:;\"',\<.\>?/_-])[\\\\0-9a-zA-Z ~!@#$%^&*()\-_=+|\\[{\\]\}:;\"',\<.\>?/]{8,16}"
      var regExp = new RegExp(reg)
      if (regExp.test(newPassword)) {
        return false
      } else {
        return true
      }
    },
    init(uid) {
      this.dataForm.uid = uid || 0
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
      })
      getRoles().then(data => {
        this.roleList = data.body.list
      }).then(() => {
        this.visible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
        })
      }).then(() => {
        if (this.dataForm.uid) {
          getInfoById(this.dataForm.uid).then(data => {
            this.dataForm.userName = data.body.username
            this.dataForm.email = data.body.email
            this.dataForm.name = data.body.name
            this.dataForm.mobile = data.body.mobile
            this.dataForm.ridList = data.body.ridList
            this.dataForm.state = data.body.state
          })
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addOrUpdate(this.dataForm.uid, {
            'uid': this.dataForm.uid || undefined,
            'username': this.dataForm.userName,
            'password': this.dataForm.password,
            'name': this.dataForm.name,
            'email': this.dataForm.email,
            'mobile': this.dataForm.mobile,
            'state': this.dataForm.state,
            'ridList': this.dataForm.ridList
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
