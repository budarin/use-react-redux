import { useAppStore } from '../../appStorage';

// Селектор намеренно написан в такой манере чтобы вызвать ошибку,
// в случае возникновения ситуации когда произойдет вызов компонента а данные не доступны
const itemSelector = (id) => (state) => {
    switch (id) {
        case 'a':
            return state.a;
        case 'b':
            return state.b;
        case 'c':
            return state.c;
        default:
            return state;
    }
};

// Намеренно вызываем props.title
// в случае stale props после удаления элемента возникнет ошибка и приложение упадет
export const ListItemContainer = ({ id }) => {
    const { props } = useAppStore({
        selector: itemSelector(id),
    });

    console.log('render ListItemContainer', props.title);

    return (
        <>
            <span>{'item'} {props.title}</span>
            <br />
        </>
    );
};
