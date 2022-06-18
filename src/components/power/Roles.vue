<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="rolesList" stripe border>
        <el-table-column type="expand">
          <template v-slot="scope">
            <!-- 栅格布局 -->
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级标签 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级标签 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <!-- 渲染二级标签 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{ scope.row }}
            </pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoleDialog(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRole(scope.row)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <el-form
        ref="addRoleFormRef"
        :model="addRoleForm"
        :rules="addRoleFormRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClosed"
    >
      <el-form
        ref="editRoleFormRef"
        :model="editRoleForm"
        :rules="editRoleFormRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MyRoles',
  data () {
    return {
      // 角色列表数组
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 树状权限
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      // 编辑角色对话框的显示与隐藏
      editRoleDialogVisible: false,
      // 编辑角色的表单
      editRoleForm: {},
      // 编辑角色表单的验证规则对象
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '长度在 1 到 10 个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            min: 1,
            max: 20,
            message: '长度在 1 到 20 个字符',
            trigger: 'blur'
          }
        ]
      },
      // 控制添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      // 添加角色对话框的表单信息
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单信息验证对象
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '长度在 1 到 10 个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            min: 1,
            max: 20,
            message: '长度在 1 到 20 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表数据
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    // 根据Id删除指定的权限
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      // console.log(confirmResult)
      if (confirmResult === 'cancel') {
        return this.$message.info('取消了删除')
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.$message.success('删除成功')
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 清空数组defKeys
      this.defKeys = []
      // 获取树形显示权限
      // 获取权限列表
      const { data: res } = await this.$http.get('rights/tree')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      this.rightslist = res.data
      // console.log(this.rightslist)
      // 递归获取三级节点id
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys (node, arr) {
      // 如果当前 node 节点中不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach((item) => this.getLeafKeys(item, arr))
    },
    // 设置权限
    async allotRights () {
      const roleId = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const idStr = roleId.join(',')
      // console.log(idStr)

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )

      // console.log(res)

      if (res.meta.status !== 200) {
        return this.$message.err(res.meta.msg)
      }

      this.getRolesList()
      this.setRightDialogVisible = false
      this.$message.success('设置权限成功')
    },
    // 监听编辑角色对话框的关闭事件
    editRoleDialogClosed () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 通过Id查找要编辑的角色的信息
    async showEditRoleDialog (role) {
      this.editRoleDialogVisible = true

      // 根据Id获取点击了编辑按钮的信息
      const { data: res } = await this.$http.get('roles/' + role.id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.editRoleForm = res.data
      // console.log(this.editRoleForm)
    },
    // 修改角色信息
    editRole () {
      // 表单预校验
      this.$refs.editRoleFormRef.validate(async (valid) => {
        if (!valid) return

        const { data: res } = await this.$http.put(
          'roles/' + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }

        this.$message.success('编辑角色成功')
        this.getRolesList()
        this.editRoleDialogVisible = false
      })
    },
    // 删除角色
    async removeRole (role) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      // console.log(confirmResult)
      if (confirmResult === 'cancel') {
        return this.$message.info('取消了删除')
      }

      const { data: res } = await this.$http.delete('roles/' + role.id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.getRolesList()
      this.$message.success('删除成功')
    },
    // 监听添加角色对话框的关闭事件
    addRoleDialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 添加角色
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }

        this.getRolesList()
        this.addRoleDialogVisible = false
        this.$message.success('添加角色成功')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.el-row {
  margin: 0 40px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
