import React, { Component } from 'react';
import './App.css';

export default class App extends Component {
 
  state = {
    todoData : [],
    value:"",
    editingId: null, // 현재 수정 중인 항목의 ID
    editingValue: "", // 수정 중인 내용
  }

  // 컴포넌트가 마운트될 때 localStorage에서 데이터 불러오기
  componentDidMount() {
    this.loadTodoData();
  }

  // localStorage에서 todoData 불러오기
  loadTodoData = () => {
    try {
      const savedTodoData = localStorage.getItem('todoData');
      if (savedTodoData) {
        const parsedData = JSON.parse(savedTodoData);
        this.setState({ todoData: parsedData });
      }
    } catch (error) {
      console.error('데이터를 불러오는데 실패했습니다:', error);
    }
  }

  // localStorage에 todoData 저장하기
  saveTodoData = (newTodoData) => {
    try {
      localStorage.setItem('todoData', JSON.stringify(newTodoData));
    } catch (error) {
      console.error('데이터를 저장하는데 실패했습니다:', error);
    }
  }

  handleClick = (id) => {
    let newTodoData = this.state.todoData.filter(data => data.id !== id)
    console.log('newTodoData',newTodoData);
    this.setState({ todoData: newTodoData }, () => {
      this.saveTodoData(newTodoData); // 상태 업데이트 후 저장
    });
  };

  handleChange = (e) => {
    console.log(e.target.value);
    this.setState({ value: e.target.value });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    
    if (!this.state.value.trim()) return; // 빈 값 방지
  
    let newTodo = {
      id: Date.now(),
      title: this.state.value,
      completed: false
    };

    const newTodoData = [...this.state.todoData, newTodo];
    this.setState({ 
      todoData: newTodoData, 
      value: "" 
    }, () => {
      this.saveTodoData(newTodoData); // 상태 업데이트 후 저장
    });
  } 

  handleCompleteChange = (id) => {
    let newTodoData = this.state.todoData.map(data => {
      if(data.id === id) {
        return { ...data, completed: !data.completed }; // 불변성 유지
      }
      return data;
    });
    this.setState({ todoData: newTodoData }, () => {
      this.saveTodoData(newTodoData); // 상태 업데이트 후 저장
    });
  }

  handleRemoveClick = () => {
    this.setState({ todoData: [] }, () => {
      this.saveTodoData([]); // 상태 업데이트 후 저장
    });
  }

  // 수정 모드 시작
  handleEditClick = (id, title) => {
    this.setState({
      editingId: id,
      editingValue: title
    });
  }

  // 수정 내용 변경
  handleEditChange = (e) => {
    this.setState({ editingValue: e.target.value });
  }

  // 수정 완료
  handleEditSubmit = (id) => {
    if (!this.state.editingValue.trim()) {
      this.handleEditCancel(); // 빈 값이면 수정 취소
      return;
    }

    let newTodoData = this.state.todoData.map(data => {
      if(data.id === id) {
        return { ...data, title: this.state.editingValue };
      }
      return data;
    });

    this.setState({
      todoData: newTodoData,
      editingId: null,
      editingValue: ""
    }, () => {
      this.saveTodoData(newTodoData); // 상태 업데이트 후 저장
    });
  }

  // 수정 취소
  handleEditCancel = () => {
    this.setState({
      editingId: null,
      editingValue: ""
    });
  }

  // Enter 키로 수정 완료, Escape 키로 수정 취소
  handleEditKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      this.handleEditSubmit(id);
    } else if (e.key === 'Escape') {
      this.handleEditCancel();
    }
  }

  render() {
    return (
      <div className="container">
        <div className="todoBlock">
          <div className="title">
            <h1>할 일 목록</h1>
            <button onClick={this.handleRemoveClick}> 전체 삭제</button>
          </div>

          {this.state.todoData.length === 0 ? (
            <div className="emptyState">
              할 일을 추가해보세요! 📝
            </div>
          ) : (
            this.state.todoData.map((data) => (
              <div className={`todoItem ${data.completed ? 'completed' : ''}`} key={data.id}>
                <input 
                  type="checkbox" 
                  checked={data.completed}
                  onChange={() => this.handleCompleteChange(data.id)} 
                />
                
                {/* 수정 모드일 때와 일반 모드일 때 다르게 렌더링 */}
                {this.state.editingId === data.id ? (
                  <div className="editMode">
                    <input
                      type="text"
                      value={this.state.editingValue}
                      onChange={this.handleEditChange}
                      onKeyDown={(e) => this.handleEditKeyPress(e, data.id)}
                      className="editInput"
                      autoFocus
                    />
                    <button 
                      className="saveBtn" 
                      onClick={() => this.handleEditSubmit(data.id)}
                    >
                      저장
                    </button>
                    <button 
                      className="cancelBtn" 
                      onClick={this.handleEditCancel}
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="viewMode">
                    <span 
                      className="todoTitle"
                      onDoubleClick={() => this.handleEditClick(data.id, data.title)}
                    >
                      {data.title}
                    </span>
                    <div className="buttonGroup">
                      <button 
                        className="editBtn" 
                        onClick={() => this.handleEditClick(data.id, data.title)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="deleteBtn" 
                        onClick={() => this.handleClick(data.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          <form className="todoForm" onSubmit={this.handleSubmit}>
            <input
              type="text"
              name="value"
              className="todoInput"
              placeholder="할 일을 입력하세요."
              onChange={this.handleChange}
              value={this.state.value}
            />
            <input
              type="submit"
              value="입력"
              className="submitBtn"
            />
          </form>

        </div>
      </div>
    );
  }
}