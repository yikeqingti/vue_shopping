<template>
    <div>
          <!-- 面包屑导航区域 -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>

          <!-- 添加分类按钮区域 -->
          <el-row>
              <el-col>
                  <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
              </el-col>
          </el-row>

          <!-- 添加分类的对话框 -->
          <el-dialog
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="50%"
            @close="addCateDialogClosed" >
            <!-- 添加分类的表单 -->
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
              <el-form-item label="分类名称：" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
              </el-form-item>
              <el-form-item label="父级分类：">
                  <!-- options 指定数据源 -->
                  <!-- props 指定配置对象 -->
                  <el-cascader
                  v-model="selectedKeys"
                  :options="parentCateList"
                  :props="cascaderProps"
                  @change="parentCateChange"
                  clearable
                  >
                  </el-cascader>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="addCateDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
          </el-dialog>

          <!-- 表格 -->
          <tree-table
          class="treeTable"
          :data="catelist"
          :columns="columns"
          :selection-type="false"
          :expand-type="false"
          :show-index="true"
          index-text="#"
          border
          :show-row-hover="false" >
          <!-- 是否有效 -->
            <template slot="isok" slot-scope="scope">
                <i class="el-icon-success" v-if="scope.row.cat_daleted===false" style="color: lightgreen;"></i>
                <i class="el-icon-error" v-else style="color: red;"></i>
            </template>
            <!-- 排序 -->
          <template slot="order" slot-scope="scope">
              <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
              <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
              <el-tag size="mini" type="warning" v-else>三级</el-tag>
          </template>
          <!-- 操作 -->
          <template slot="option">
              <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
          </template>
          </tree-table>
          
          <!-- 分页 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="querInfo.pagenum"
            :page-sizes="[3, 5, 10, 15]"
            :page-size="querInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
      </el-card>
    </div>
</template>

<script>
export default {
    data(){
        return{
            //查询条件
            querInfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },

            // 控制添加分类对话框的显示
            addCateDialogVisible:false,
            // 添加分类的表单对象
            addCateForm:{
                // 将要添加的分类名称
                cat_name:'',
                // 父级分类的id
                cat_pid:0,
                // 分类等级，默认1级分类
                cat_level:0
            },
            // 验证规则对象
            addCateFormRules:{
                cat_name:[
                    { required:true,message:'请输入分类名称',tigger:'blur' }
                ]
            },
            // 父级分类的数据列表
            parentCateList:[],
            // 指定级联选择器的配置对象
            cascaderProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children',
                expandTrigger:'hover'
            },
            // 选中的父级分类的id数组
            selectedKeys:[],

            //商品列表的数据，默认为空
            catelist:[],
            //总数据条数
            total:0,
            columns:[{
                label:'分类名称',
                prop:'cat_name'
            },{
                label:'是否有效',
                //表示当前列定义为自定义模板
                type:'template',
                //模板名称
                template:'isok'
            },{
                label:'排序',
                //表示当前列定义为自定义模板
                type:'template',
                //模板名称
                template:'order'
            },{
                label:'操作',
                //表示当前列定义为自定义模板
                type:'template',
                //模板名称
                template:'option'
            }]
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        // 获取商品分类数据
        async getCateList(){
           const {data:res} =  await this.$http.get('categories',{ params:this.querInfo })
           if(res.meta.status !==200){
               return this.$message.console.error('获取商品分类信息失败');
               
           }
        //    console.log(res.data);
        // 吧数据列表赋值过去
           this.catelist=res.data.result
           this.total=res.data.total
        },
        // 监听pagesize改变
        handleSizeChange(newSize){
            this.querInfo.pagesize=newSize
            this.getCateList()
        },
        // 监听pagenum改变
        handleCurrentChange(newPage){
            this.querInfo.pagenum=newPage
            this.getCateList()
        },
        // 添加分类对话框
        showAddCateDialog(){
            this.getParentCateList()
            this.addCateDialogVisible=true
        },
        // 获取父级分类的数据列表
        async getParentCateList(){
            const {data:res} = await this.$http.get('categories',{ params:{ type:2 } })
            if(res.meta.status !==200){
                return this.$message.error('获取父级分类数据失败！')
            }

            // console.log(res.data);
            this.parentCateList=res.data
            
        },
        // 选择项发生变化触发
        parentCateChange(){
            // console.log(this.selectedKeys);
            
            // 如果selectedKeys数组中的长度大于0，则选中了父级分类，否则就没有
            if(this.selectedKeys.length>0){
                // 父级分类的id
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
                // 当前分类的等级
                this.addCateForm.cat_level=this.selectedKeys.length
                return
            }else{
                // 父级分类的id
                this.addCateForm.cat_pid = 0
                // 当前分类的等级
                this.addCateForm.cat_level= 0
            }
            
        },
        // 点击添加新分类
        addCate(){
            // console.log(this.addCateForm);
            this.$refs.addCateFormRef.validate(async valid =>{
                if(!valid) return
                const {data:res} = await this.$http.post('categories',this.addCateForm)
                if(res.meta.status !==201){
                    return this.$message.error('添加分类失败')
                }
                this.$message.success('添加分类成功')
                this.getCateList()
                this.addCateDialogVisible=false
            })
            
        },
        // 表单关闭，重置表单
        addCateDialogClosed(){
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys=[]
            this.addCateForm.cat_pid=0
            this.addCateForm.cat_level=0
        }
    }
}
</script>

<style lang="less" scoped>
.treeTable{
    margin-top: 15px;
}
.el-cascader{
    width: 100%;
}

</style>