<template>
    <div>
          <!-- 面包屑导航区域 -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图 -->
      <el-card>
          <!-- 添加角色列表区域 -->
          <el-row>
              <el-col>
                  <el-button type="primary" @click="addRolesDialogVisible=true">添加角色</el-button>
              </el-col>
          </el-row>
          <el-table :data="roleList" border stripe>
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-row :class="['bdbottom',i1===0 ? 'bdtop': '','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                        <!-- 渲染一级权限 -->
                        <el-col :span="5">
                            <el-tag closable @close="removeRightById(scope.row,item1.id)">
                                {{item1.authName}}
                            </el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <!-- 渲染二级权限 -->
                        <!-- 渲染三级权限 -->
                        <el-col :span="19">
                            <el-row :class="[i2===0 ? '': 'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                              <el-col :span="6">
                                  <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                  <i class="el-icon-caret-right"></i>
                              </el-col>
                              <el-col :span="18">
                                  <el-tag type="warning" :class="[i3===0 ? '': 'bdtop']"
                                   v-for="(item3,i3) in item2.children" :key="item3.id" 
                                   closable @close="removeRightById(scope.row,item3.id)">
                                      {{item3.authName}}
                                  </el-tag>
                              </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                    <!-- <pre>{{scope.row}}</pre> -->
                </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit"  @click="showRolesEditDialog(scope.row.id)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete"  @click="removeRolesUserById(scope.row.id)">删除</el-button>
                    <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
          </el-table>
      </el-card>
      <!-- 添加角色对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addRolesDialogVisible"
        width="50%"
        @close="addRolesDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addRolesForm" :rules="addRolesFormRules" ref="addRolesFormRef" label-width="70px">
          <el-form-item label="角色名称" prop="roleName" label-width="100px">
            <el-input v-model="addRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc" label-width="100px">
            <el-input v-model="addRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRolesuser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑角色的对话框 -->
      <el-dialog
        title="编辑角色"
        :visible.sync="editRolesDialogVisible"
        width="50%"
        @close="editRolesDialogClosed">
         <el-from :model="editRolesForm" :rules="editRolesFormRules" ref="editRolesFormRef" label-width="70px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRolesForm.roleName"></el-input>
          </el-form-item>
         <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRolesForm.roleDesc"></el-input>
          </el-form-item>
           </el-from>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRolesUserInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限的对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightDiglogClosed"
        >
        <!-- 树形控件 -->
       <el-tree :data="Roleslist" :props="treeProps" show-checkbox node-key="id"
       default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRoles">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return{
            //所有角色列表数据
            roleList:[],
            //控制分配权限对话框
            setRightDialogVisible:false,
            //所有权限的数据
            Roleslist:[],
            //树形控件的树形绑定对象
            treeProps:{
                label:'authName',
                children:'children'
            },
            //默认选中的id
            defKeys:[],
            // 当前即将分配角色的id
            roleId:'',
            // 添加角色对话框的控制
            addRolesDialogVisible:false,
            //添加角色的表单数据
            addRolesForm:{
              roleName:'',
              roleDesc:'',
            },
            //添加角色的验证规则对象
            addRolesFormRules:{
              roleName:[
                { required:true,message:'请输入角色名',tigger:'blur' },
                { min:2,max:8,message:'角色名的长度在2-8个字符之间',tigger:'blur' }
              ],
              roleDesc:[
                { required:true,message:'请输入角色描述',tigger:'blur' }
              ]
            },
            //控制编辑角色对话框
            editRolesDialogVisible:false,
            //查询到的用户信息对象
            editRolesForm:{},
            editRolesFormRules:{
                 roleName:[
                { required:true,message:'请输入角色名',tigger:'blur' },
                { min:2,max:8,message:'角色名的长度在2-8个字符之间',tigger:'blur' }
              ],
               roleDesc:[
                { required:true,message:'请输入角色描述',tigger:'blur' }
              ]
            },
        }
    },
    created(){
        this.getRolesList()
    },
    methods:{
        //获取所有角色列表
        async getRolesList(){
            const {data:res} = await this.$http.get('roles')
            if(res.meta.status !==200){
                return this.$message.error('获取角色列表失败'); 
            }
            this.roleList=res.data
            // console.log(this.roleList);
        },
        //根据id删除对应的权限
        async removeRightById(role,rightId){
            //弹框提升用户是否删除
            const confirmRes = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).catch(err=>err)
          if(confirmRes !=='confirm'){
              return this.$message.info('取消了本次删除')
          }
          const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
          if(res.meta.status !==200){
              return this.$message.error('删除权限失败')
          }
        //   this.getRolesList()
        role.children=res.data
          this.$message.success('删除权限成功')
        },
        //展示分配权限的对话框
        async showSetRightDialog(role){
            this.roleId=role.id
            //获取所有权限的数据
            const {data:res} =await this.$http.get('rights/tree')
            if(res.meta.status !==200){
                return this.$message.error('获取权限失败')
            }
            this.Roleslist=res.data
            // console.log(this.Roleslist);

            //递归获取三级节点的id
            this.grtLeafKeys(role,this.defKeys)

            this.setRightDialogVisible=true
        },
        // 通过递归获取角色所有的三级权限id
        grtLeafKeys(node,arr){
            if(!node.children){
                return arr.push(node.id)
            }

            node.children.forEach(item => 
              this.grtLeafKeys(item,arr))
        },
        // 监听分配权限对话框的关闭事件
        setRightDiglogClosed(){
            this.defKeys=[]
        },
        // 点击为角色分配权限
        async allotRoles(){
            const keys=[
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            // console.log(keys);

            const idStr=keys.join(',')
            const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
            if(res.meta.status !==200){
                return this.$message.error('分配权限失败')
            }

            this.$message.success('分配权限成功')
            this.getRolesList()
            this.setRightDialogVisible=false
        },
        addRolesDialogClosed(){
           this.$refs.addFormRef.resetFields()
         },
        //添加角色
        addRolesuser(){
            this.$refs.addRolesFormRef.validate(async valid=>{
          // console.log(valid);
          if(!valid) return
          const {data:res} = await this.$http.post('roles',this.addRolesForm)
          if(res.meta.status !==201){
            this.$message.error('添加角色失败')
          }
            this.$message.success('添加角色成功')
            //隐藏添加角色的对话框
            this.addRolesDialogVisible=false
            // 重新获取角色列表
            this.getRolesList()
            })
      },
      
      //展示修改角色的对话框
      async showRolesEditDialog(id){
        // console.log(roleName);
        console.log(id);
        
        const {data:res} = await this.$http.put('roles/'+id)
        if(res.meta.status !==200){
          return this.$message.error('获取角色信息信息失败')
        }
        this.editRolesForm=res.data
        this.editRolesDialogVisible=true
      },
      //监听编辑角色对话框的关闭事件
      editRolesDialogClosed(){
        this.$refs.editRolesFormRef.resetFields()
      },
      //编辑角色信息并提交
      editRolesUserInfo(){
        this.$refs.editRolesFormRef.validate(async valid=>{
          // console.log(valid);
          if(!valid) return
          //编辑角色请求
          const {data:res} = await this.$http.put('roles/'+this.editRolesForm.id,{
            roleName:this.editRolesForm.roleName,
            roleDesc:this.editRolesForm.roleDesc
          })
          if(res.meta.status !==200){
            return this.$message.error('编辑角色信息失败')
          }

          this.editRolesDialogVisible=false
          this.getRolesList()
          this.$message.success('编辑角色信息成功')
        })
      },
      async removeRolesUserById(id){ 
        const confirmRes = await this.$confirm(
          '此操作将永久删除该角色, 是否继续?', '提示', 
          {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        // console.log(confirmRes);
        if(confirmRes !=='confirm'){
          return this.$message.info('已取消删除')
        }
        const {data:res} = await this.$http.delete('roles/'+id)
        if(res.meta.status !==200){
          return this.$message.error('删除角色失败')
        }
        this.$message.success('删除角色成功')
        this.getRolesList()
      },
    }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}

.bdtop {
    border-top: 1px solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>