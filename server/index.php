<?php
header('Access-Control-Allow-Origin: *');

// Функция создания таблицы при первом запуске
function create() {
    $sql = 'CREATE TABLE "resume" (
        "id"	TEXT NOT NULL UNIQUE,
        "name"	TEXT,
        "age"	INTEGER CHECK("age" > 0),
        "gender"	INTEGER,
        "email"	TEXT,
        "phone"	INTEGER,
        "image"	TEXT,
        "resume_update_date"	INTEGER,
        "entry_update_date"	INTEGER,
        PRIMARY KEY("id")
    );';
}


$db = new SQLite3("database.sqlite");

// Если по POST передаются данные, то происходит их запись. Иначе вывод всех имеющихся
if ( !empty( $_POST['id'] ) && ( preg_match('/^[a-z0-9]{38}$/', $_POST['id']) ) ) {
    $id = $_POST['id'];
    
    // Получаем имеющуюся информацию о данном резюме
    $result = $db->querySingle("SELECT name, age, gender, email, phone, image, resume_update_date FROM resume WHERE id='{$id}'", true);
    
    if ( empty( $result ) ) {
        $newResult = array(
            'name' => null,
            'age' => null,
            'gender' => null,
            'email' => null,
            'phone' => null,
            'image' => null,
            'resume_update_date' => null
        );
    } else {
        $newResult = $result;
    }
    
    /* Фильтрация данных */
    if ( !empty($_POST['name']) ) {
        $newResult['name'] = $_POST['name'];
    }
    
    if ( !empty($_POST['age']) && is_numeric($_POST['age']) && (int)$_POST['age'] > 0 ) {
        $newResult['age'] = (int)$_POST['age'];
    }
    
    if ( isset($_POST['gender']) && ( $_POST['gender'] == '0' || $_POST['gender'] == '1' ) ) {
        $newResult['gender'] = (int)$_POST['gender'];
    }
    
    if ( !empty($_POST['update_date']) && is_numeric($_POST['update_date']) && (int)$_POST['update_date'] > 0  ) {
        $newResult['resume_update_date'] = (int)$_POST['update_date'];
    }
    
    if ( !empty($_POST['email']) && filter_var( $_POST['email'], FILTER_VALIDATE_EMAIL ) ) {
        $newResult['email'] = filter_var( $_POST['email'], FILTER_VALIDATE_EMAIL );
    }
    
    if ( !empty($_POST['phone']) && is_numeric($_POST['phone']) && (int)$_POST['phone'] > 0 ) {
        $newResult['phone'] = (int)$_POST['phone'];
    }
    
    if ( !empty($_POST['image']) && filter_var( $_POST['image'], FILTER_VALIDATE_URL ) ) {
        $newResult['image'] = filter_var( $_POST['image'], FILTER_VALIDATE_URL );
    }
    /* ----- */
    
    // Перезапись происходит только в случае если новые данные отличаются от имеющихся
    if ( $result !== $newResult ) {
        $query = $db->prepare('REPLACE INTO resume(id, name, age, gender, email, phone, image, resume_update_date, entry_update_date) VALUES(:id, :name, :age, :gender, :email, :phone, :image, :resume_update_date, :entry_update_date)');
        $query->bindValue(':id', $id, SQLITE3_TEXT);
        
        if ( $newResult['name'] !== null ) {
            $query->bindValue(':name', $newResult['name'], SQLITE3_TEXT);
        } else {
            $query->bindValue(':name', null, SQLITE3_NULL);
        }
        
        if ( $newResult['age'] !== null ) {
            $query->bindValue(':age', $newResult['age'], SQLITE3_INTEGER);
        } else {
            $query->bindValue(':age', null, SQLITE3_NULL);
        }
        
        if ( $newResult['gender'] !== null ) {
            $query->bindValue(':gender', $newResult['gender'], SQLITE3_INTEGER);
        } else {
            $query->bindValue(':gender', null, SQLITE3_NULL);
        }
        
        if ( $newResult['email'] !== null ) {
            $query->bindValue(':email', $newResult['email'], SQLITE3_TEXT);
        } else {
            $query->bindValue(':email', null, SQLITE3_NULL);
        }
        
        if ( $newResult['phone'] !== null ) {
            $query->bindValue(':phone', $newResult['phone'], SQLITE3_INTEGER);
        } else {
            $query->bindValue(':phone', null, SQLITE3_NULL);
        }
        
        if ( $newResult['image'] !== null ) {
            $query->bindValue(':image', $newResult['image'], SQLITE3_TEXT);
        } else {
            $query->bindValue(':image', null, SQLITE3_NULL);
        }
        
        if ( $newResult['resume_update_date'] !== null ) {
            $query->bindValue(':resume_update_date', $newResult['resume_update_date'], SQLITE3_INTEGER);
        } else {
            $query->bindValue(':resume_update_date', null, SQLITE3_NULL);
        }
        
        $query->bindValue(':entry_update_date', time(), SQLITE3_INTEGER);
        
        echo ( ( $query->execute() ) ? 'ok' : 'error' );
    }
    
    echo 'ok';
} else {
    echo '<html>';
    echo '<head>';
    echo '<meta charset="utf-8">';
    echo '</head>';
    echo '<body>';
    echo '<table border="1">';
    echo '<tr><td>ID</td><td>Аватар</td><td>Имя</td><td>Возраст</td><td>Пол</td><td>Почта</td><td>Телефон</td><td>Обновление профиля</td><td>Обновление данной записи</td></tr>';
    
    $results = $db->query('SELECT * FROM resume ORDER BY entry_update_date DESC');
    while ($row = $results->fetchArray()) {
        $gender = '';
        if ( $row['gender'] === 0 ) {
            $gender = 'Мужской';
        } else if ( $row['gender'] === 1 ) {
            $gender = 'Женский';
        }
        
        $image = ( !empty( $row['image'] ) ) ? "<image style='width:50px;' src='{$row['image']}'>" : '';
        $phone = ( !empty( $row['phone'] ) ) ? "<a href='tel:+{$row['phone']}'>{$row['phone']}</a>" : '';
        $email = ( !empty( $row['email'] ) ) ? "<a href='mailto:{$row['email']}'>{$row['email']}</a>" : '';
        
        $update_resume = ( $row['resume_update_date'] !== null ) ? date("d.m.Y H:i:s", $row['resume_update_date']) : '';
        $update_entry = ( $row['entry_update_date'] !== null ) ? date("d.m.Y H:i:s", $row['entry_update_date']) : '';
        
        echo "<tr>
            <td><a target='_blank' href='https://hh.ru/resume/{$row['id']}'>{$row['id']}</a></td>
            <td>{$image}</td>
            <td>{$row['name']}</td>
            <td>{$row['age']}</td>
            <td>{$gender}</td>
            <td>{$email}</td>
            <td>{$phone}</td>
            <td>{$update_resume}</td>
            <td>{$update_entry}</td>
        </tr>";
    }
    
    echo '</table>';
    echo '</body>';
    echo '</html>';
}

$db->close();
unset($db);