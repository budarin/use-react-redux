import { useAppStore } from '../../appStorage';
import { actions, simpleSelector } from '../../ducks';
import { ListItemContainer } from '../ListItemContainer';

export const ListContainer = () => {
    const containerProps = useAppStore({
        selector: simpleSelector,
        actions,
    });

    console.log('render ListContainer');

    return (
        <>
            {Object.keys(containerProps.props).map((key) => {
                return <ListItemContainer key={key} id={key} />;
            })}
            <br />
            <button onClick={containerProps.actions.delete}>Delete</button>
            <button onClick={containerProps.actions.reset}>Reset</button>
        </>
    );
};
