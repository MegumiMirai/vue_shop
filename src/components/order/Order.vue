<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>顶单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索输入框 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number">
        </el-table-column>
        <el-table-column label="订单价格" prop="order_price"> </el-table-column>
        <el-table-column label="是否付款">
          <template v-slot="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'"
              >未付款</el-tag
            >
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否加货" prop="is_send"> </el-table-column>
        <el-table-column label="下单时间">
          <template v-slot="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <el-tooltip
            effect="dark"
            content="修改物流信息"
            :enterable="false"
            placement="top"
          >
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showAddressDialog"
            ></el-button>
          </el-tooltip>
          <el-tooltip
            effect="dark"
            content="物流进度"
            :enterable="false"
            placement="top"
          >
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressDialog"
            ></el-button>
          </el-tooltip>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改物流地址的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <!-- 表单 -->
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityOptions"
            v-model="addressForm.address1"
            :props="{ expandTrigger: 'hover' }"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流消息对话框 -->
    <el-dialog title="物流消息" :visible.sync="progressVisible" width="50%">
      <el-timeline :reverse="true">
        <el-timeline-item
          v-for="(item, index) in progressData"
          :key="index"
          :timestamp="item.time"
        >
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityOptions from '@/js/citydata.js'
export default {
  name: 'MyOrder',
  data () {
    return {
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单商品列表
      orderList: [],
      // 订单总数
      total: 0,
      cityOptions: cityOptions,
      city: [],
      // 控制修改地址对话框的显示与隐藏
      addressDialogVisible: false,
      // 修改表单
      addressForm: {
        address1: [],
        address2: ''
      },
      // 修改表单的验证规则对象
      addressFormRules: {
        address1: { required: true, message: '请选择', trigger: 'blur' },
        address2: {
          required: true,
          message: '请填写详细地址',
          trigger: 'blur'
        }
      },
      // 控制物流进度对话框的显示与隐藏
      progressVisible: false,
      // 物流信息
      progressData: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(this.orderList)
    },
    // 页面展示条数变化
    handleSizeChange (newSize) {
      this.orderList.pagesize = newSize
      this.getOrderList()
    },
    // 当前页数变化
    handleCurrentChange (newNum) {
      this.orderList.pagenum = newNum
      this.getOrderList()
    },
    showAddressDialog () {
      this.addressDialogVisible = true
    },
    // 关闭表单，重置表单数据
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 展示物流进度对话框
    async showProgressDialog () {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.progressData = res.data
      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
