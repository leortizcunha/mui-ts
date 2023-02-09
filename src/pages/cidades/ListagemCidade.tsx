import { useEffect, useMemo, useState } from 'react';

import { IconButton, Icon, LinearProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { green, red } from '@mui/material/colors';

import { IListagemCidade, CidadesService } from '../../shared/services/api/cidades/CidadesService';
import { FerramentasDaListagem } from '../../shared/components';
import { Environment } from '../../shared/environment';
import { LayoutBasePage } from '../../shared/layouts';
import { useDebounce } from '../../shared/hooks';

export const ListagemCidade: React.FC = () => {

	const [searchParams, setSearchParams] = useSearchParams();

	const { debounce } = useDebounce();

	const navigate = useNavigate();


	const [rows, setRows] = useState<IListagemCidade[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	const busca = useMemo(() => {
		return searchParams.get('busca') || '';
	}, [searchParams]);

	const pagina = useMemo(() => {
		return Number(searchParams.get('pagina') || '1');
	}, [searchParams]);

	useEffect(() => {
		setIsLoading(true);

		debounce(() => {
			CidadesService.getAll(pagina, busca)
				.then((result) => {
					setIsLoading(false);

					if (result instanceof Error) {
						alert(result.message);
					} else {
						console.log(result);

						setTotalCount(result.totalCount);
						setRows(result.data);
					}
				});
		});
	}, [busca, pagina]);

	const handleDelete = (id: number) => {

		if (confirm('Deseja apagar o registro?')) {
			CidadesService.deleteById(id)
				.then(result => {
					if (result instanceof Error) {
						alert(result.message);
					} else {
						setRows(oldRows => [
							...oldRows.filter(oldRow => oldRow.id !== id)
						]);

						alert('Registro apagado!');
					}
				});
		}

	};

	return (
		<LayoutBasePage
			title='Listagem de Cidades'
			barraDeFerramentas={
				<FerramentasDaListagem
					mostrarInputBusca
					textoBotaoNovo='Nova'
					textoDaBusca={busca}
					aoClicarEmNovo={() => navigate('/cidades/detalhe/nova')}
					aoMudarTextoDeBusca={texto => setSearchParams({ busca: texto, pagina: '1' }, { replace: true })}
				/>
			}
		>

			<TableContainer component={Paper} variant="outlined" sx={{ m: 1, width: 'auto' }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell width="100">Ações</TableCell>

							<TableCell>Nome</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{rows.map(row => (
							<TableRow key={row.id}>
								<TableCell sx={{p: 0.5}}>

									<IconButton size="small" onClick={() => handleDelete(row.id)}>
										<Icon sx={{color: red[500]}}>delete</Icon>
									</IconButton>

									<IconButton size="small" onClick={() => navigate(`/cidades/detalhe/${row.id}`)}>
										<Icon sx={{ color: green[500] }}>edit</Icon>
									</IconButton>

								</TableCell>

								<TableCell>{row.nome}</TableCell>

							</TableRow>
						))}
					</TableBody>

					{totalCount === 0 && !isLoading && (
						<caption>{Environment.LISTAGEM_VAZIA}</caption>
					)}

					<TableFooter>
						{isLoading && (
							<TableRow>
								<TableCell colSpan={3}>
									<LinearProgress variant="indeterminate" />
								</TableCell>
							</TableRow>
						)}

						{(totalCount > Environment.LIMIT_DE_LINHAS) && (
							<TableRow>
								<TableCell colSpan={3}>
									<Pagination
										count={Math.ceil(totalCount / Environment.LIMIT_DE_LINHAS)}
										page={pagina}
										onChange={(_, newPage) => setSearchParams({ busca, pagina: newPage.toString() }, { replace: true })}
									/>
								</TableCell>
							</TableRow>
						)}
					</TableFooter>
				</Table>
			</TableContainer>

		</LayoutBasePage>
	);
};