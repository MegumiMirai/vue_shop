<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        align-center
        finish-status="success"
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品照片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 标签页 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        class="demo-ruleForm"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item
              v-for="item1 in manyTableData"
              :key="item1.attr_id"
              :label="item1.attr_name"
            >
              <!-- 多选框 -->
              <el-checkbox-group v-model="item1.attr_vals">
                <el-checkbox
                  v-for="(item2, index) in item1.attr_vals"
                  :key="index"
                  :label="item2"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品照片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce">

            </quill-editor>
            <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片的对话框 -->
    <el-dialog title="预览图片" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'MyAdd',
  data () {
    return {
      // 进度条当前的索引
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择器选择的数组
        goods_cat: [],
        // 上传的图片数组
        pics: [],
        // 商品介绍
        goods_introduce: '',
        // 动态参数和静态属性
        attrs: []
      },
      // 添加商品表单的验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类数据列表
      cateList: [],
      // 级联选择器参数对象
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 上传图片路径
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 配置上传图片的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的路径
      previewPath: '',
      // 控制预览图片对话框的显示与隐藏
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 级联选择器发生变化，会触发这个函数
    handleChange () {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 再tab页签改变时触发此函数
    beforeTabLeave (activeName, oldActiveName) {
      // console.log(activeName, oldActiveName)
      // return false
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 点击tab标签的时候触发
    async tabClicked () {
      // console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        // 获取动态参数
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } }
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.manyTableData = res.data
        this.manyTableData.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        // console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } }
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      // console.log(file)
      this.previewPath = file.response.data.url
      // console.log(this.previewPath)
      this.previewVisible = true
    },
    // 处理移除图片操作
    handleRemove (file) {
      // console.log(file)
      // 1.获取将要删除的图片的临时地址
      const filePath = file.response.data.tmp_path
      // 2.从 pics 数组中，找到这个图片对应的索引值
      const index = this.addForm.pics.findIndex((item) => {
        return item.pic === filePath
      })
      // console.log(index)
      // 3.调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },
    // 监听图片上传成功事件
    handleSuccess (response) {
      // console.log(response)
      // 1.拼接得到的一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 将拼接的对象，push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 点击添加商品的按钮
    add () {
      // console.log(this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 执行添加表单的业务逻辑
        // 1.将 addform 中的 goods_cat变成以逗号间隔的字符串
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 2.处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 3.处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)

        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }

        this.$router.push('/goods')
        this.$message.success('添加商品成功')
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg{
  width: 100%;
}

.addBtn{
  margin-top: 15px;
}
</style>
