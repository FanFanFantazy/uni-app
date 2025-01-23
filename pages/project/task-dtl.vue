<template>
	<view class="task-card">
		<view class="att-input">
			<input v-model="taskForm.name" type="number" placeholder="Please enter..." placeholder-class="placeholder" cursor-spacing="100"/>
		</view>
	</view>
	<view class="task-card">
		<textarea v-model="taskForm.desc" maxlength="-1"	auto-height="true" class="att-textarea"
		placeholder="Please enter..." placeholder-class="placeholder" cursor-spacing="100"></textarea>
	</view>
	<view class="task-card">
		<view class="half-div">金额
			<view class="att-input">
				<input v-model="taskForm.investment" type="number" placeholder="Please enter..." placeholder-class="placeholder" cursor-spacing="100"/>
			</view>
		</view>
		<view class="half-div">类型
			<picker class="att-input" mode="selector" @change="pickerChange" :value="typeOp.indexOf(taskForm.type)" :range="typeOp">
				<view>{{taskForm.type}}&nbsp;</view>
			</picker>
		</view>
	</view>
	<view class="task-card">
		<view class="half-div">预期金额
			<view class="att-input">
				<input v-model="taskForm.est_payback" type="number" placeholder="Please enter..." placeholder-class="placeholder" cursor-spacing="100"/>
			</view>
		</view>
		<view class="half-div">实际金额
			<view class="att-input">
				<input v-model="taskForm.act_payback" type="number" placeholder="Please enter..." placeholder-class="placeholder" cursor-spacing="100"/>
			</view>
		</view>
	</view>
	<view class="add-btn" @click="updateTask">更新任务内容</view>
	<view class="task-card">相关图片
		<view style="padding: 16rpx;">
			<view class="add-image" @click="uploadImage"><text class="icon-plus"></text></view>
			<view class="task-image" v-for="(img, index) in imageList" :key="img.fileUrl">
				<image :src="img.fileUrl" mode="aspectFill" @click="previewImage(img.fileUrl)"></image>
				<text class="icon-bin icon-btn delete-image" @click="deleteImage(img.fileUrl, img._id, index)"></text>
			</view>
		</view>
	</view>
	<view class="task-card">相关文档</view>
	<view class="empty-end"></view>
</template>

<script setup>
	import { onMounted, reactive, ref, toRefs } from 'vue'
	
	const task = reactive({
		taskForm: {
			_id: null,
			desc: '',
			name: '',
			investment: 0,
			type: '',
			est_payback: 0, 
			act_payback: 0,
		}
	})
	const {taskForm} = toRefs(task)
	wx.cloud.init()
	const db = wx.cloud.database()
	const optionData = reactive({
		typeOp: ['收入', '支出']
	})
	const {typeOp} = toRefs(optionData)
	function pickerChange(e) {
    task.taskForm.type = optionData.typeOp[e.detail.value]
  }
	
	import { onLoad } from '@dcloudio/uni-app'
	const taskdb = db.collection('task')
	
	onLoad((e) => {
		task._id = e.id
		queryTask()
	})
	function queryTask () {
		wx.showLoading()
		taskdb.where({'_id': task._id}).get().then(res => {
		  task.taskForm = res.data[0];
			getImage()
		}).finally(() => {
			wx.hideLoading()
		})
	}
	function updateTask() {
		let temp = task.taskForm
		delete temp._openid
		delete temp._id
		wx.showLoading()
		taskdb.where({'_id': task._id}).update({
			data: temp
		}).finally(() => {
			wx.hideLoading()
		})
	}
	
	// image
	
	// image operation
	
	const imageTable = db.collection('task_image')
	const mainData = reactive({
		imageList: []
	})
	const {imageList} = toRefs(mainData)
	import {Media} from '@/common/common.js'
	// upload
	function uploadImage () {
		wx.showLoading()
		new Media().open(9).then(res => {
			new Media().upload(res[0].tempFilePath, 'taskImage/').then(res2 => {
				imageTable.add({data: {
				  cloud_path: res2.fileID,
					create_date: new Date(),
					task_id: task.taskForm._id
				}}).then(res3 => {
					imageList.value.unshift({ fileUrl: res2.fileID, _id: res3._id })
				}).finally(() => {
					wx.hideLoading()
				})
			})
		}).catch(() => {
			wx.hideLoading()
		})
	}
	
	function getImage () {
		wx.showLoading()
		imageTable.where({'task_id': task.taskForm._id}).orderBy('create_date', 'desc').get().then((res) => {
			imageList.value = res.data.map(o => {return {fileUrl: o.cloud_path, _id: o._id}})
		}).finally(() => {
			wx.hideLoading()
		})
	}
	function previewImage (url) {
		let urls = []
		urls = imageList.value.map(f => {return f.fileUrl})
		new Media().preview(url, urls)
	}
	function deleteImage (url, _id, index) {
		wx.showLoading()
		new Media().delete([url]).then(res => {
			imageTable.doc(_id).remove({}).then(res2 => {
				imageList.value.splice(index, 1)
			}).then(() => {
				wx.cloud.deleteFile({fileList: [url]}).then(() => {
					wx.showToast({title: '删除成功'})
				}).catch(() => {
					wx.showToast({title: '删除失败'})
				})
			}).finally(() => {
				wx.hideLoading()
			})
		})
	}
	
</script>

<style scoped>
	.task-name {
	  font-size: 18px;
    font-weight: 600;
		text-align: center;
	}
	.task-card {
		padding: 16rpx;
		background: #8DAA913A;
		margin: 16rpx;
	}
	.task-content {
		padding: 16rpx;
		background-color: #ffffff;
		margin-top: 16rpx;
	}
	.half-div {
		width: 50%;
		display: inline-block;
		vertical-align: top;
	}
	.add-image {
		width: calc(25% - 16rpx);
		margin: 8rpx;
		height: 200rpx;
		display: inline-block;
		background-color: #ffffff;
		text-align: center;
		line-height: 200rpx;
		vertical-align: top;
	}
	.task-image {
		display: inline-block;
		width: calc(25% - 16rpx);
		vertical-align: top;
		margin: 8rpx;
	}
	.task-image  image {
		width: 100%;
		height: 200rpx;
	}
	.delete-image {
		position: absolute; margin-left: -50rpx;background-color: #ffffff8F;
		border-bottom-left-radius: 10rpx;
	}
</style>