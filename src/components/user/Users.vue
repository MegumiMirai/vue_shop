<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 搜索输入框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUsersInfo()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUsersInfo()"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- 搜索按钮 -->
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table style="width: 100%" :data="userlist" stripe border>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"> </el-table-column>
        <el-table-column label="邮箱" prop="email"> </el-table-column>
        <el-table-column label="电话" prop="mobile"> </el-table-column>
        <el-table-column label="角色" prop="role_name"> </el-table-column>
        <el-table-column label="状态">
          <template v-slot="{ row }">
            <!-- {{scope.row.mg_state}} -->
            <el-switch v-model="row.mg_state" @change="changeState(row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot="{ row }">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showUpdateDialog(row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRoles(row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 分配角色对话框 -->
      <el-dialog
        title="分配角色"
        :visible.sync="setRoleDialogVisible"
        width="50%"
        @close="setRoleDialogClosed"
      >
        <p>当前的用户： {{ userinfo.username }}</p>
        <p>当前的角色： {{ userinfo.role_name }}</p>
        <span>分配新角色： </span>
        <el-select v-model="selectedId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="resetAddForm"
    >
      <!-- 内容主体区域 -->
      <el-form
        label-width="70px"
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息的对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="updateDialogVisible"
      width="50%"
      @close="resetUpdateForm"
    >
      <!-- 内容主体区域 -->
      <el-form
        label-width="70px"
        :model="updateForm"
        :rules="updateFormRules"
        ref="updateFormRef"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="updateForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="updateForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="updateForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUserInfo()">确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MyUsers',
  data () {
    // 验证邮箱的规则
    const checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-X0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 验证通过，合法的邮箱
        cb()
      }
      cb(new Error('请输入合法的邮箱地址'))
    }

    // 验证手机号的规则
    const checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 验证通过
        cb()
      }
      cb(new Error('请输入合法的电话号码'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的信息
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户的表单验证对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          {
            min: 6,
            max: 16,
            message: '长度在 6 到 16 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户信息的表单
      updateForm: {},
      // 修改用户信息的表单验证对象
      updateFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户信息对话框的显示与隐藏
      updateDialogVisible: false,
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 分配角色时保存的数据
      userinfo: {},
      // 所有角色的列表
      rolesList: [],
      // 将要分配角色的id
      selectedId: ''
    }
  },
  created () {
    this.getUsersInfo()
  },
  methods: {
    async getUsersInfo () {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表数据失败！！！')
      }
      console.log(res)
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 监听pageSize改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUsersInfo()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUsersInfo()
    },
    // 监听用户状态事件
    async changeState (userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.state = !userinfo.state
        return this.$message.error('修改用户状态失败！！！')
      }
      // console.log(res)
      this.$message.success('修改用户状态成功！！！')
    },
    // 重置表单
    resetAddForm () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮，添加用户
    addUser () {
      // 表单预校验
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 可以发起添加用户的ajax操作
        const { data: res } = await this.$http.post('/users', this.addForm)
        // console.log(res)

        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)

        this.$message.success('添加用户成功！！！')
        // 隐藏对话框
        this.addDialogVisible = false
        // 重新获取用户数据
        this.getUsersInfo()
      })
    },
    resetUpdateForm () {
      this.$refs.updateFormRef.resetFields()
    },
    // 展示修改用户信息的对话框
    async showUpdateDialog (id) {
      this.updateDialogVisible = true
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败！！！')
      }
      console.log(res)

      this.updateForm = res.data
    },
    // 修改用户信息
    updateUserInfo () {
      // 验证表单信息对象
      this.$refs.updateFormRef.validate(async (valid) => {
        if (!valid) return

        const { data: res } = await this.$http.put(
          'users/' + this.updateForm.id,
          { email: this.updateForm.email, mobile: this.updateForm.mobile }
        )

        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户数据失败！！！')
        }

        // 隐藏修改用户信息的对话框
        this.updateDialogVisible = false
        // 重新获取用户信息
        this.getUsersInfo()
        // 更新成功的信息
        this.$message.success('更新用户数据成功')
      })
    },
    // 根据Id删除用户
    async removeUserById (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      console.log(confirmResult)
      // 如果点击了取消，返回字符串cancel
      // 如果点击了确然，返回字符串confirm
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')

      // 如果删除的是最后一页并且最后一页只有一条数据，则将pagenum-1
      if (
        this.total ===
        (this.queryInfo.pagenum - 1) * this.queryInfo.pagesize + 1
      ) {
        this.queryInfo.pagenum--
      }
      this.getUsersInfo()
      this.$message.success('删除成功')
    },
    // 分配角色
    async setRoles (userinfo) {
      this.userinfo = userinfo
      // console.log(this.userinfo)
      // 获取角色列表
      const { data: res } = await this.$http.get('roles')
      console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 根据Id设置角色
    async saveRoleInfo () {
      if (!this.selectedId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userinfo.id}/role`,
        {
          rid: this.selectedId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.$message.success('设置角色成功')
      this.getUsersInfo()
      this.setRoleDialogVisible = false
    },
    // 监听修改用户角色对话框的关闭
    setRoleDialogClosed () {
      this.selectedId = ''
    }
  }
}
</script>

<style lang="less" scoped></style>
